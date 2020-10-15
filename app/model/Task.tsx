class Task {
  name: string;

  value: number;

  max: number;

  type: string;

  step: number;

  constructor(
    name: string,
    value: number,
    max: number,
    type: string,
    step: number
  ) {
    this.name = name;
    this.value = value;
    this.max = max;
    this.type = type;
    this.step = step;
  }
}
