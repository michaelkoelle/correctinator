enum InitializationMode {
  MANUAL,
  PESSIMISTIC,
  OPTIMISTIC,
}
export default InitializationMode;

export function getInitialValue(
  mode: InitializationMode,
  value: number,
  max: number,
  min = 0
) {
  switch (mode) {
    case InitializationMode.OPTIMISTIC:
      return max;
    case InitializationMode.PESSIMISTIC:
      return min;
    default:
      return value;
  }
}
