// Will legend and details boxes go below viz, or to its right?
export function getLayoutApproach(layoutInput, documentWidth) { 
    const smallestWideCanvasWidth = 1300;
    let boxesBelowViz; 
    if (layoutInput === "Wide") {
        boxesBelowViz = false;
    }
    else if (layoutInput === "Tall") {
        boxesBelowViz = true;
    }
    else {
        boxesBelowViz = documentWidth < smallestWideCanvasWidth;
    }
    // Width/height of the canvas, including the legend and details panel
    let canvasWidth, canvasHeight;
    if (boxesBelowViz) {
        canvasWidth = 800;
        canvasHeight = 1400; 
    } else {
        canvasWidth = smallestWideCanvasWidth;
        canvasHeight = 820;
    }

    return {boxesBelowViz, canvasWidth, canvasHeight}
}

  // This specifies what percentage is the threshhold for good or bad
  // True = green = good ("within the donut") = exactly 0 
export function isGoodForOuter(percentage) {
    return percentage === null ? null : percentage === 0;
}

export function isGoodForInner(percentage) {
    return isGoodForOuter(percentage);
}