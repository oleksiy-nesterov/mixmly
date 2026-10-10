export type GradientLayer = {
  position: string;
  size: string;
  color: string;
};

export type GradientParams = {
  base: string;
  layers: GradientLayer[];
};
