import 'pathseg';
import Matter, {
  Engine,
  World,
  Render,
  Runner,
  Bodies,
  Body,
  Composite,
  Mouse,
  MouseConstraint,
  Svg,
  Vertices,
  Bounds,
  Events,
  Query,
  Vector,
  Common,
  IMousePoint,
} from 'matter-js';
import MatterAttractors from 'matter-attractors';
import decomp from 'poly-decomp';

// eslint-disable-next-line react-hooks/rules-of-hooks
Matter.use(MatterAttractors);
Common.setDecomp(decomp);

import {
  DEBUG_RENDER_OPTIONS,
  GLYPH_SCALE,
  WALL_SIZE,
  GLYPH_CATEGORY,
  GLYPH_FRICTION_AIR,
  GLYPH_MASS,
  GLYPH_SPACING,
  PROCESS_ACTIVE_SLOTS_INTERVAL,
  ACTIVE_GLYPH_SCALE,
  ATTRACTOR_POSITION_Y,
  ATTRACTOR_RADIUS,
  ACTIVE_SLOTS_COUNT,
  ACTIVE_SLOTS_REGEXP,
  SLICE_CATEGORY,
} from './Mixmly.constants';

import {
  MixmlyGlyphPayload,
  MixmlyRenderer,
  MixmlyOptions,
  MixmlySomething,
  MixmlyGlyphState,
  MixmlyAction,
} from './Mixmly.types';
import {
  createCanvas,
  getViewportSize,
  sliceToPolygons,
  splitTokens,
} from './Mixmly.utils';
import { isExpressionCorrect } from '@/utils/math.ts';
import { debounce } from '@/utils/debounce.ts';
import { TOKEN_PATHS } from '@/components/Tokens/Tokens.constants.ts';

export default class Mixmly {
  private static readonly glyphsCache = new Map<
    string,
    Omit<MixmlyGlyphPayload, 'position' | 'localX' | 'localY'>
  >();

  private readonly element: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly onRender: MixmlyRenderer;
  private readonly onChange?: (tokens: string[]) => void;
  private readonly onComplete?: (tokens: string[]) => void;
  private readonly onAction?: (action: MixmlyAction) => void;

  private engine: Engine | null = null;
  private runner: Runner | null = null;
  private walls: Body[] | null = null;
  private attractor: Body | null = null;
  private mouseConstraint: MouseConstraint | null = null;
  private mousePosition: Vector | null = null;
  private activeSlots: Array<Body | null> =
    Array(ACTIVE_SLOTS_COUNT).fill(null);

  private hoveredGlyphValue: Body | null = null;
  private debugValue: boolean;

  private onMouseDown = () => {
    if (!this.engine) return;

    this.mousePosition = { ...this.engine.render.mouse.position };
    this.wakeUpAllGlyphs();
  };

  private onMouseUp = () => {
    if (!this.engine || !this.mousePosition) return;

    const distance = Vector.magnitude(
      Vector.sub(this.engine.render.mouse.position, this.mousePosition),
    );

    this.mousePosition = null;
    this.canvas.style.cursor = 'default';
    if (distance > 8) {
      if (this.hoveredGlyphValue) {
        this.onAction?.('drag');
      }
      this.processActiveSlots();
      return;
    }

    const g = this.getGlyphAtPosition(this.engine.render.mouse.position);

    if (!g) {
      this.processActiveSlots();
      return;
    }

    this.onAction?.('click');
    this.clickGlyph(g);
    this.processActiveSlots();
  };

  private onMouseMove = () => {
    if (!this.engine) return;

    const g = this.getGlyphAtPosition(this.engine.render.mouse.position);

    if (!g) {
      this.hoveredGlyphValue = null;
      this.canvas.style.cursor = 'default';
      return;
    }

    if (this.hoveredGlyph === g) {
      return;
    }

    this.wakeUpGlyph(g);
    this.hoveredGlyphValue = g;
    this.canvas.style.cursor =
      this.activeSlotIndex >= 0 || this.isActive(g) ? 'pointer' : 'default';
  };

  private onMouseLeave = () => {
    this.hoveredGlyphValue = null;
    this.canvas.style.cursor = 'default';
  };

  private removeSleepingSlices = () => {
    if (!this.engine) return;
    const sleepingSlices = this.getSlices().filter((g) => g.isSleeping);

    if (!sleepingSlices.length) return;
    Composite.remove(this.engine.world, sleepingSlices);
  };

  private updateGlyphs = () => {
    if (!this.engine) return;

    this.removeSleepingSlices();
  };

  private renderGlyphs = () => {
    if (!this.engine || this.debug) return;

    this.getGlyphs().forEach((g) => {
      if (!this.engine) return;
      this.onRender(g, this.engine, this);
    });

    this.getSlices().forEach((g) => {
      if (!this.engine) return;
      this.onRender(g, this.engine, this);
    });
  };

  private getSlices = () => {
    if (!this.engine) return [];

    return Composite.allBodies(this.engine.world).filter(
      (b) => b.collisionFilter.category === SLICE_CATEGORY,
    );
  };

  private getGlyphs = () => {
    if (!this.engine) return [];

    return Composite.allBodies(this.engine.world).filter(
      (b) => b.collisionFilter.category === GLYPH_CATEGORY,
    );
  };

  private wakeUpGlyph = (g: Body) => {
    Body.set(g, 'isSleeping', false);
  };

  private wakeUpAllGlyphs = () => {
    this.getGlyphs().forEach(this.wakeUpGlyph);
  };

  private getGlyphAtPosition = (position: IMousePoint) => {
    if (!this.engine) return null;

    return Query.point(this.getGlyphs(), position)[0] || null;
  };

  private kickGlyph = (g: Body) => {
    this.wakeUpGlyph(g);
    g.frictionAir = GLYPH_FRICTION_AIR;
    const normalizedAngle = Math.atan2(Math.sin(g.angle), Math.cos(g.angle));
    Body.setAngularVelocity(g, -normalizedAngle * 0.25);
    Body.applyForce(g, g.position, {
      x: (Math.random() - 0.5) * 0.08,
      y: -0.12,
    });
  };

  private flyGlyph = (g: Body) => {
    g.frictionAir = 0.08;
    Body.setStatic(g, false);
    Body.setVelocity(g, { x: 0, y: 0 });
    Body.setAngle(g, 0);
    Body.setAngularVelocity(g, 0);
    Body.setInertia(g, Infinity);
  };

  private resize = () => {
    if (!this.engine) {
      return;
    }

    const { width, height } = getViewportSize(this.element);
    Render.setSize(this.engine.render, width, height);
    this.engine.render.canvas.style.width = `${width}px`;
    this.engine.render.canvas.style.height = `${height}px`;

    this.alignWalls();
    this.alignAttractor(width / 2, ATTRACTOR_POSITION_Y);
    this.wakeUpAllGlyphs();
  };

  private bindEvents = () => {
    window.addEventListener('resize', this.resize);
    this.canvas?.addEventListener('mouseleave', this.onMouseLeave);

    if (!this.engine) return;

    Events.on(this.engine, 'afterUpdate', this.updateGlyphs);
    Events.on(this.engine.render, 'afterRender', this.renderGlyphs);
    Events.on(this.mouseConstraint, 'mousedown', this.onMouseDown);
    Events.on(this.mouseConstraint, 'mousemove', this.onMouseMove);
    Events.on(this.mouseConstraint, 'mouseup', this.onMouseUp);
  };

  private unbindEvents = () => {
    window.removeEventListener('resize', this.resize);
    this.canvas?.removeEventListener('mouseleave', this.onMouseLeave);

    if (!this.engine) return;

    Events.off(this.engine, 'afterUpdate', this.updateGlyphs);
    Events.off(this.engine.render, 'afterRender', this.renderGlyphs);
    Events.off(this.mouseConstraint, 'mousedown', this.onMouseDown);
    Events.off(this.mouseConstraint, 'mousemove', this.onMouseMove);
    Events.off(this.mouseConstraint, 'mouseup', this.onMouseUp);
  };

  private processActiveSlots = debounce(() => {
    const expressionTokens = this.activeSlots
      .filter<Body>((g) => !!g)
      .sort((a, b) => a.position.x - b.position.x)
      .map((g) => g.label);

    const expression = expressionTokens.join('');

    if (
      !ACTIVE_SLOTS_REGEXP.test(expression) ||
      !isExpressionCorrect(expression)
    ) {
      return;
    }

    this.onComplete?.(expressionTokens);
    this.addToWorld(
      this.activeSlots
        .filter((glyph) => !!glyph)
        .map((glyph) => sliceToPolygons(glyph, 30, 100))
        .flat(),
    );
    this.removeFromWorld(this.activeSlots as Body[]);
    this.activeSlots = Array(ACTIVE_SLOTS_COUNT).fill(null);
  }, PROCESS_ACTIVE_SLOTS_INTERVAL);

  private addToWorld = (something: MixmlySomething) => {
    if (!this.engine) return;

    Composite.add(this.engine.world, something);
    this.onChange?.(this.tokens);
  };

  private removeFromWorld = (something: MixmlySomething) => {
    if (!this.engine) return;

    Composite.remove(this.engine.world, something);
    this.onChange?.(this.tokens);
  };

  private removeAllGlyphs = () => {
    this.removeFromWorld(this.getGlyphs());
    this.activeSlots = Array(ACTIVE_SLOTS_COUNT).fill(null);
    this.mousePosition = null;
    this.hoveredGlyphValue = null;
  };

  private clickGlyph = (g: Body) => {
    if (!g.plugin.state) {
      g.plugin.state = {
        angle: g.angle,
        scale: GLYPH_SCALE,
        previousState: null,
      } as MixmlyGlyphState;
    }

    const state = g.plugin.state;
    this.wakeUpAllGlyphs();

    if (!this.isActive(g)) {
      if (this.activeSlotIndex === -1) {
        return;
      }

      state.previousState = {
        angle: state.angle,
        scale: state.scale,
      };
      const scaleFactor = ACTIVE_GLYPH_SCALE / state.scale;
      Body.scale(g, scaleFactor, scaleFactor);
      state.scale = ACTIVE_GLYPH_SCALE;
      Body.setAngle(g, 0);
      Body.setAngularVelocity(g, 0);
      this.activeSlots[this.activeSlotIndex] = g;
      this.flyGlyph(g);
    } else {
      const prev = state.previousState;
      const scaleFactor = prev.scale / state.scale;
      Body.scale(g, scaleFactor, scaleFactor);
      state.scale = prev.scale;
      Body.setAngle(g, prev.angle);
      Body.setAngularVelocity(g, 0);
      const activeIndex = this.activeSlots.findIndex((glyph) => glyph === g);
      if (activeIndex >= 0) {
        this.activeSlots[activeIndex] = null;
      }
      this.kickGlyph(g);
    }
  };

  private pathToGlyph = (x: number, y: number, id: string) => {
    let data = Mixmly.glyphsCache.get(id);

    if (!data) {
      const pathEl = TOKEN_PATHS.find((v) => v.id === id);
      const shapeEl = TOKEN_PATHS.find((v) => v.id === `${id} shape`);
      const shape = shapeEl ?? pathEl;

      if (!shape) {
        throw new Error(`Unknown glyph shape: ${id}`);
      }

      const vertices = Svg.pathToVertices(shape, 8);
      const center = Vertices.centre(vertices);
      const bounds = Bounds.create(vertices);
      const path = pathEl ?? shapeEl;

      if (!path) {
        throw new Error(`Unknown glyph path: ${id}`);
      }

      const pathData = path.getAttribute('d');

      if (!pathData) {
        throw new Error(`Unknown glyph path data: ${id}`);
      }

      data = {
        vertices,
        center,
        width: bounds.max.x - bounds.min.x,
        height: bounds.max.y - bounds.min.y,
        path2d: new Path2D(pathData),
      };
      Mixmly.glyphsCache.set(id, data);
    }

    const g = Bodies.fromVertices(
      x,
      y,
      [data.vertices],
      {
        label: id,
        render: {
          ...DEBUG_RENDER_OPTIONS,
          visible: this.debug,
        },
      },
      false,
    );

    g.plugin.payload = {
      id,
      center: data.center,
      width: data.width,
      height: data.height,
      path2d: data.path2d,
    };

    return g;
  };

  private tokenToGlyph = (token: string, x: number, y: number) => {
    const allParts: Body[] = [];
    const allPayload: MixmlyGlyphPayload[] = [];
    let offsetX = 0;

    [...token].forEach((id) => {
      const glyphBody = this.pathToGlyph(x + offsetX, y, id);
      const realParts =
        glyphBody.parts.length > 1 ? glyphBody.parts.slice(1) : [glyphBody];

      allParts.push(...realParts);
      allPayload.push({
        ...glyphBody.plugin.payload,
        position: { ...glyphBody.position },
      });
      offsetX += glyphBody.plugin.payload.width + GLYPH_SPACING;
    });

    const g = Body.create({
      parts: allParts,
      label: token,
      frictionStatic: 8,
      friction: 0.8,
      frictionAir: GLYPH_FRICTION_AIR,
      restitution: 0,
      slop: 0,
      collisionFilter: {
        category: GLYPH_CATEGORY,
      },
    });

    g.plugin.payload = allPayload.map((payload) => ({
      ...payload,
      localX: payload.position.x - g.position.x,
      localY: payload.position.y - g.position.y,
    }));

    Body.setAngle(g, (Math.random() * 2 - 1) * 0.3);
    Body.scale(g, GLYPH_SCALE, GLYPH_SCALE);
    Body.setDensity(g, 0.005);
    Body.setMass(g, GLYPH_MASS);
    Body.setPosition(g, { x, y });
    return g;
  };

  private createWalls = () => {
    const wallOptions = {
      label: '',
      isStatic: true,
      friction: 1,
      restitution: 0,
      slop: 0,
      render: {
        visible: false,
      },
    };

    this.walls = [
      Bodies.rectangle(0, 0, 1, 1, wallOptions),
      Bodies.rectangle(0, 0, 1, 1, wallOptions),
      Bodies.rectangle(0, 0, 1, 1, wallOptions),
    ];

    if (this.engine?.world) {
      Composite.add(this.engine.world, this.walls);
    }
    this.alignWalls();
  };

  private alignWalls = () => {
    if (!this.walls?.length) return;

    const [bottom, left, right] = this.walls;
    const { width, height } = getViewportSize(this.element);
    const wallHeight = height * 2;

    Body.setPosition(bottom, {
      x: width / 2,
      y: height + WALL_SIZE / 2,
    });
    Body.setVertices(
      bottom,
      Bodies.rectangle(
        width / 2,
        height + WALL_SIZE / 2,
        width + WALL_SIZE * 2,
        WALL_SIZE,
      ).vertices,
    );

    Body.setPosition(left, {
      x: -WALL_SIZE / 2,
      y: height / 2,
    });
    Body.setVertices(
      left,
      Bodies.rectangle(-WALL_SIZE / 2, height / 2, WALL_SIZE, wallHeight)
        .vertices,
    );

    Body.setPosition(right, {
      x: width + WALL_SIZE / 2,
      y: height / 2,
    });
    Body.setVertices(
      right,
      Bodies.rectangle(width + WALL_SIZE / 2, height / 2, WALL_SIZE, wallHeight)
        .vertices,
    );
  };

  private createAttractor = (x: number, y: number) => {
    this.attractor = Bodies.circle(x, y, ATTRACTOR_RADIUS, {
      label: '',
      isStatic: true,
      isSensor: true,
      render: {
        ...DEBUG_RENDER_OPTIONS,
        visible: this.debug,
      },
      plugin: {
        attractors: [
          (attractor: Body, g: Body) => {
            if (!this.isActive(g)) {
              return null;
            }
            const dx = attractor.position.x - g.position.x;
            const dy = attractor.position.y - g.position.y;
            return {
              x: dx * 0.00008,
              y: dy * 0.001,
            };
          },
        ],
      },
    });

    if (this.engine?.world) {
      Composite.add(this.engine.world, this.attractor);
    }
  };

  private alignAttractor = (x: number, y: number) => {
    if (!this.attractor) return;

    Body.setPosition(this.attractor, { x, y });
  };

  isActive = (g: Body) => {
    return !!this.activeSlots.find((glyph) => g === glyph);
  };

  get activeSlotIndex() {
    return this.activeSlots.findIndex((v) => v === null);
  }

  get debug() {
    return this.debugValue;
  }

  set debug(value: boolean) {
    this.debugValue = value;
    if (this.engine) {
      this.getGlyphs().forEach((body) => {
        if (value) {
          body.render.visible = false;
          Object.assign(body.render, DEBUG_RENDER_OPTIONS);
          return;
        }
      });
    }
    this.wakeUpAllGlyphs();
  }

  constructor({
    element,
    debug = false,
    onRender,
    onChange,
    onComplete,
    onAction,
  }: MixmlyOptions) {
    this.canvas = createCanvas(element);
    this.element = element;
    this.debugValue = debug;
    this.onRender = onRender;
    this.onChange = onChange;
    this.onComplete = onComplete;
    this.onAction = onAction;
  }

  get hoveredGlyph() {
    return this.hoveredGlyphValue;
  }

  get tokens() {
    return this.getGlyphs()
      .map((g) => g.label)
      .filter(Boolean);
  }

  tokenize = (tokens: string | string[]) => {
    const { width, height } = getViewportSize(this.element);

    this.addToWorld(
      (Array.isArray(tokens) ? tokens : splitTokens(tokens))
        .filter(Boolean)
        .map((token) =>
          this.tokenToGlyph(
            token,
            10 + Math.random() * (width - 10),
            10 + Math.random() * (-height - 10),
          ),
        ),
    );
  };

  init = () => {
    if (this.engine) {
      return;
    }

    const engine = Engine.create({
      enableSleeping: true,
      positionIterations: 20,
      velocityIterations: 12,
      constraintIterations: 4,
      gravity: { y: 1.2 },
    });

    const { width, height } = getViewportSize(this.element);
    const render = Render.create({
      canvas: this.canvas,
      engine,
      options: {
        width: width,
        height: height,
        background: 'transparent',
        wireframes: false,
        showPositions: this.debug,
        showBounds: this.debug,
      },
    });

    render.mouse = Mouse.create(render.canvas);
    this.mouseConstraint = MouseConstraint.create(engine, {
      mouse: render.mouse,
      constraint: {
        stiffness: 0.08,
        damping: 0.35,
        render: {
          visible: false,
        },
      },
    });

    this.engine = engine;
    this.engine.render = render;
    this.runner = Runner.create();
    Composite.add(this.engine.world, this.mouseConstraint);
    Render.run(render);
    Runner.run(this.runner, engine);
    this.createWalls();
    this.createAttractor(width / 2, 100);
    this.bindEvents();
    this.resize();
  };

  destroy = () => {
    this.unbindEvents();

    if (this.runner) {
      Runner.stop(this.runner);
    }

    if (this.engine) {
      Mouse.clearSourceEvents(this.engine.render.mouse);
      Render.stop(this.engine.render);
      Composite.clear(this.engine.world, false);
      World.clear(this.engine.world, false);
      Engine.clear(this.engine);
      this.engine.render.canvas.remove();
      this.engine.render.textures = {};
    }

    this.canvas.remove();
    this.engine = null;
    this.mouseConstraint = null;
    this.hoveredGlyphValue = null;
    this.walls = null;
    this.attractor = null;
    this.mousePosition = null;
    this.activeSlots = Array(ACTIVE_SLOTS_COUNT).fill(null);
  };

  start = (tokens: string) => {
    if (!this.engine) {
      this.init();
    }
    this.removeAllGlyphs();
    this.load(splitTokens(tokens));
  };

  load = (tokens: string[]) => {
    if (!this.engine) {
      this.init();
    }
    this.tokenize(tokens);
  };
}
