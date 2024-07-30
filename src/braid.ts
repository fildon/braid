/**
 * A crossing represents a relationship between two adjacent ropes.
 *
 * A pair of ropes can cross in two ways:
 * - Left-over-right
 *  - The front rope resembles the body of an `S`.
 * - Right-over-left
 *  - The front rope resembles the body of a `Z`.
 */
type CrossingKind = "S" | "Z";

/**
 * A crossing is a kind, but also exists at some location
 */
type Crossing = {
  kind: CrossingKind;
  /**
   * 0-index row within the parent Braid
   */
  rowIndex: number;
  /**
   * 0-index column within the row.
   *
   * Beware however that index 0 / the first col,
   * corresponds to the relationship between the first two ropes,
   * i.e. in the space between the first and second ropes.
   * because of this there is one fewer possible crossing in a row than there are ropes in a row.
   * The largest col index is the braid width - 2.
   */
  colIndex: number;
};

/**
 * A braid has some number of ropes, each of the same length.
 * A braid contains some number of crossings
 */
export type Braid = {
  length: number;
  ropes: number;
  crossings: Set<Crossing>;
};

/**
 * Construct a 10X10 braid with no crossings.
 */
export const createBraid = (): Braid => ({
  length: 10,
  ropes: 10,
  crossings: new Set(),
});

/**
 * Utility function primarily to assist in constructing immutable updates to a braid
 */
const cloneBraid = (braid: Braid): Braid => ({
  length: braid.length,
  ropes: braid.ropes,
  crossings: new Set([...braid.crossings].map((crossing) => ({ ...crossing }))),
});

/**
 * Immutably create a new braid, by adding a crossing to an existing braid
 */
const createCrossing = (crossing: Crossing, braid: Braid): Braid => {
  const newBraid = cloneBraid(braid);
  // This is naughty mutation! But only on a fresh clone.
  // So it's safe within the body of this function.
  newBraid.crossings = new Set([...newBraid.crossings, crossing]);
  return newBraid;
};

/**
 * Immutably create a new braid, by updating a crossing in an existing braid
 */
const updateCrossing = (crossing: Crossing, braid: Braid): Braid =>
  createCrossing(
    crossing,
    removeCrossing(crossing.rowIndex, crossing.colIndex, braid)
  );

/**
 * Immutably create a new braid, by removing a crossing from an existing braid
 */
const removeCrossing = (
  rowIndex: number,
  colIndex: number,
  braid: Braid
): Braid => {
  const newBraid = cloneBraid(braid);
  // This is naughty mutation! But only on a fresh clone.
  // So it's safe within the body of this function.
  newBraid.crossings = new Set(
    [...newBraid.crossings].filter(
      (crossing) =>
        crossing.rowIndex === rowIndex && crossing.colIndex === colIndex
    )
  );
  return newBraid;
};

/**
 * Given a `braid` and a `location`, immutably create a new braid with some form of update carried out.
 *
 * Not all updates are legal! In case of an invalid request, null is returned.
 * Notably there can never be two horizontally adjacent crossings.
 * That would require a single rope to go in two different directions at the same time.
 *
 * For valid requests,
 * - a non-crossing becomes an `S` crossing
 * - an `S` crossing becomes a `Z` crossing
 * - a `Z` crossing becomes a non-crossing
 */
export const handleCrossingRequest = (
  braid: Braid,
  [colIndex, rowIndex]: [number, number]
): Braid | null => {
  if (rowIndex < 0)
    throw new Error(`Negative y index: ${rowIndex} is not supported`);
  if (colIndex < 0)
    throw new Error(`Negative x index: ${colIndex} is not supported`);
  if (rowIndex > braid.length - 1)
    throw new Error(
      `y index of ${rowIndex} is too high for braid with height: ${braid.length}`
    );
  if (colIndex > braid.ropes - 2)
    throw new Error(
      `x index of ${colIndex} is too high for braid with width: ${braid.ropes}`
    );

  const crossingsInRow = [...braid.crossings].filter(
    (crossing) => crossing.rowIndex === rowIndex
  );

  // If there is already an adjacent crossing,
  // then we cannot apply a crossing at the requested location.
  if (
    crossingsInRow.some(
      (crossing) => Math.abs(crossing.colIndex - colIndex) === 1
    )
  )
    return null;

  const crossingAtLocation = crossingsInRow.find(
    (crossing) => crossing.colIndex === colIndex
  );

  // There is no crossing
  if (!crossingAtLocation)
    return createCrossing({ kind: "S", rowIndex, colIndex }, braid);

  // there is an S crossing
  if (crossingAtLocation.kind === "S")
    return updateCrossing({ kind: "Z", rowIndex, colIndex }, braid);

  // There is a Z crossing
  return removeCrossing(rowIndex, colIndex, braid);
};
