const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

function getMonthRanges(months) {
  let crossesYearBoundary = false;
  let edges = [];
  for (let monthIndex in months) {
    monthIndex = Number(monthIndex);
    let currMonth = months[monthIndex];
    let nextMonthIndex = monthIndex + 1;
    nextMonthIndex = nextMonthIndex < months.length ? nextMonthIndex : 0;
    let nextMonth = months[nextMonthIndex];
    if (currMonth === undefined || nextMonth === undefined) {
      throw Error("month values are undefined");
    }
    if (currMonth == nextMonth) {
      continue;
    }
    if (currMonth === "Yes") {
      if (edges.length == 0) {
        crossesYearBoundary = true;
      }
      edges.push(MONTH_NAMES[monthIndex]);
    } else {
      edges.push(MONTH_NAMES[nextMonthIndex]);
    }
  }

  if (crossesYearBoundary) {
    let shouldBeFirstEdge = edges.pop();
    edges.unshift(shouldBeFirstEdge);
  }

  if (edges.length == 0) {
    return "All Year";
  }

  if (edges.length % 2 !== 0) {
    console.log(months);
    throw Error(
      "Uneven number of edges for month ranges, something went wrong"
    );
  }

  let monthRangesStr = "";
  for (let i = 0; i < edges.length; i += 2) {
    monthRangesStr += `${edges[i]}-${edges[i + 1]},`;
  }
  monthRangesStr = monthRangesStr.slice(0, -1); // Chop off last comma
  return monthRangesStr;
}

console.log(
  getMonthRanges([
    "Yes",
    "No",
    "No",
    "Yes",
    "Yes",
    "Yes",
    "No",
    "No",
    "No",
    "Yes",
    "Yes",
    "Yes",
  ])
);
