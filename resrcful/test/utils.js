const diffPrimitive = (expected, actual, errorPrefix = "value") => {
  if (expected !== actual) {
    return { expected, actual };
  }
};

const diffArr = (expected, actual, errorPrefix = "array") => {
  const diffs = {};
  expected.forEach((expectedItem, idx) => {
    const actualItem = actual?.[idx];
    const diff = diffValue(expectedItem, actualItem, `${errorPrefix}[${idx}]`);
    if (diff) {
      diffs[idx] = diff;
    }
  });

  if (expected.length !== actual?.length) {
    diffs.keyLength = { expected: expected.length, actual: actual?.length };
  }
  if (Object.keys(diffs).length) {
    return diffs;
  }
};

const diffObj = (expected, actual, errorPrefix = "obj") => {
  const diffs = {};
  for (let [key, expectedValue] of Object.entries(expected)) {
    const actualValue = actual?.[key];
    const diff = diffValue(expectedValue, actualValue, `${errorPrefix}['${key}']`);
    if (diff) {
      diffs[key] = diff;
    }
  }

  const diff = diffArr(
    Object.keys(expected).sort(),
    Object.keys(actual || []).sort(),
    `Object.keys(${errorPrefix})`
  );

  if (diff) {
    diffs.keys = diff;
  }

  if (Object.keys(diffs).length) {
    return diffs;
  }
};

export const diffValue = (expected, actual, errorPrefix = "value") => {
  if (expected instanceof Array) {
    return diffArr(expected, actual, errorPrefix);
  }
  if (typeof expected === "object" && expected !== null) {
    return diffObj(expected, actual, errorPrefix);
  }
  return diffPrimitive(expected, actual, errorPrefix);
};

const getJoinedTargetHierarchy = (target, timerange, isParent = false) => {
  if (target.parent) {
    return `${getJoinedTargetHierarchy(target.parent, timerange, true)} -> ${target.name}`;
  }
  if (isParent) {
    return target.name;
  }
  return timerange.targetHierarchy.join(" -> ");
};

const getDateKey = (d) => (typeof d === "string" ? d : d.toISOString());

export const formatSchedulerOutput = ({ targets }, result = { timeranges: {}, targets: {} }) => {
  for (let target of Object.values(targets)) {
    result = formatSchedulerOutput({ targets: target.subtargets }, result);
    let targetKey;
    const targetResult = { start: "9999-99-99", end: "0000-00-00" };
    const contributors = new Set();
    const concurrentEmployeeCounts = {};
    for (let timerange of target._scheduledTimeRanges) {
      if (!targetKey) {
        targetKey = getJoinedTargetHierarchy(target, timerange);
      }
      const startKey = getDateKey(timerange.start._jsDate);
      const endKey = getDateKey(timerange.end._jsDate);

      if (!concurrentEmployeeCounts[startKey]) {
        concurrentEmployeeCounts[startKey] = 0;
      }
      concurrentEmployeeCounts[startKey]++;

      if (startKey < targetResult.start) {
        targetResult.start = startKey;
      }
      if (endKey > targetResult.end) {
        targetResult.end = endKey;
      }
      contributors.add(timerange.employeeName);

      if (!result.timeranges[startKey]) {
        result.timeranges[startKey] = {};
      }
      if (result.timeranges[startKey][timerange.employeeName]) {
        console.log(
          startKey,
          timerange.employeeName,
          result.timeranges[startKey][timerange.employeeName]
        );
        console.log(timerange);
        throw new Error("Duplicate time range for employee");
      }
      result.timeranges[startKey][timerange.employeeName] = targetKey;
    }

    targetResult.maxConcurrentEmployees = Math.max(...Object.values(concurrentEmployeeCounts), 0);
    if (
      target.maxAssigneesAtOnce &&
      targetResult.maxConcurrentEmployees > target.maxAssigneesAtOnce
    ) {
      console.log(targetKey, target.maxAssigneesAtOnce, targetResult.maxConcurrentEmployees);
      throw new Error(`Target has too many concurrent assignees`);
    }
    targetResult.contributors = [...contributors].sort();
    result.targets[targetKey] = targetResult;
  }
  return result;
};
