function _1(md){return(
md`# Donut Economics Seattle City Portrait`
)}

function _2(htl){return(
htl.html`<p>Humanity’s current challenge is to meet the needs of all (from food and housing to healthcare and political voice) within the means of our planet (stable climate, fertile soils, and a protective ozone layer). Kate Raworth introduced the ideas of <a href="https://doughnuteconomics.org/about-doughnut-economics">Donut Economics</a>, where the “donut” is a way to visualize how well we’re meeting these social and planetary boundaries, on both a local and global scale. <a href="https://doughnuteconomics.org/organisations-and-networks/seattle-donut-economics-coalition"></p>
<p>Seattle Donut Economics Coalition</a> is pulling together data to understand our Seattle community’s position in these boundaries, serving as a compass for how we can improve (following the methodology of <a href="https://doughnuteconomics.org/tools/creating-city-portraits">Creating City Portraits</a> and <a href="https://doughnuteconomics.org/tools/doughnut-unrolled-data-portrait-of-place">Doughnut Unrolled: Data Portrait of Place</a>). We’ve started by focusing on Local-Social (inner circle) and Local-Ecological (outer circle) impacts, with later iterations to account for our Global-Social and Global-Ecological impacts too. We’re just getting started and this is just a first draft – we’d love to get your thoughts and ideas as we work to improve our understanding!</p>`
)}

function _3(htl){return(
htl.html`<h2>To use your own data</h2>
<span>Create your own Google sheet using the format of <a href="https://docs.google.com/spreadsheets/d/17u5GECoGqdyKBz5xciyF_T2emLzwvgw4gaGn4l7atjg/edit?gid=0#gid=0">our sheet for Seattle</a>, and link yours below</span>`
)}

function _sheetInput(Inputs){return(
Inputs.text({label: "Link to your google sheet"})
)}

function _5(htl){return(
htl.html`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0,0" /> 
<!-- FYI: 
- See icons here and put their "icon name" in your spreadsheet: https://fonts.google.com/icons
- To change the icon styling, change the values after the family name. Documentation here: https://developers.google.com/fonts/docs/material_symbols 
--> `
)}

function _6(d3,sheetInput,response)
{
  const div = d3.create("div");
  if (sheetInput && response.errorHtml) {
    div.html("<p><b>Error</b>: Are you sure this is a valid google doc with public viewing permissions?<br>Using the example sheet in this case.</p>")
    return div.node();  
  }
  else { return div.node(); }
}


function _chartSlope_v5(d3,response)
{
 // ------------------------------------ Constants ------------------------------------
  // *********** Sizing ***********
  // Width/height of just the donut visualization (without the legend and details panel)
  const width = 800;
  const height = 800;
  
  // If this is false, we will put legend and details boxes to the right of the viz
  const wideCanvasWidth = 1300;
  let boxesBelowViz = document.documentElement.clientWidth < wideCanvasWidth;
  console.log("Document width: ", document.documentElement.clientWidth)
  // Width/height of the canvas, including the legend and details panel
  let canvasWidth, canvasHeight, maxVizWidth;
  if (boxesBelowViz) {
    canvasWidth = 800;
    canvasHeight = 1400;
    // Even if your window is wide enough, don't get bigger than this
    maxVizWidth = 800;    
  } else {
    canvasWidth = wideCanvasWidth;
    canvasHeight = 820;
    maxVizWidth = 10000;
  }


  // *********** Donut sizes ***********
  const planet_outer_radius = (Math.min(width, height) / 2) ; // Worst overshoot
  const planet_inner_radius = planet_outer_radius * 0.65;     // Smallest overshoot
  const donut_outer_radius = planet_inner_radius;
  const donut_inner_radius = donut_outer_radius * 0.6;
  const donut_center_radius = (donut_outer_radius + donut_inner_radius) / 2;
  const human_outer_radius = donut_inner_radius;            // Smallest unmet need
  const human_inner_radius = human_outer_radius * 0.0;      // Worst unmet need 

  // *********** Colors ***********
  // FYI: If you want to change the colors, make sure it's a color-blind accessible palette
  const extra_light_green = '#E4FFE7'       // Currently unused, design didn't have this 
  const light_green = '#78D569'             // Design had #009129 but it was unused
  const green = '#009129'
  const dark_green = '#06562A'        // Design had #5dd749 but that seems too light?
  const extra_light_red = '#ffe7de'
  const light_red = '#FFA07A'         // Currently unused
  const red = '#F36749'
  const dark_red = '#9f2828'          // Currently unused
  const gray = '#E0E0E0'
  const hover_outline = '#AAAAAA'
  const click_outline = 'black'
  const c = d3.scaleOrdinal()
    .domain([true, false, null])    // Green = we are in the safe zone
    .range([green, red, gray]);


  // ------------------------ General setup ------------------------
  // const responsivefy = (svg) => {
  //   // get container + svg aspect ratio
  //   var container = d3.select(svg.node().parentNode),
  //       retrieved_width = parseInt(svg.style("width")),
  //       retrieved_width = parseInt(svg.style("height")),
  //       aspect = retrieved_width / retrieved_width;
  
  // get width of container and resize svg to fit it  
  //   const resize = () => {
  //       var targetWidth = parseInt(container.style("width"));
  //       svg.attr("width", targetWidth);
  //       svg.attr("height", Math.round(targetWidth / aspect));
  //   };
  //   // add viewBox and preserveAspectRatio properties,
  //   // and call resize so that svg resizes on inital page load
  //   svg.attr("viewBox", "0 0 " + retrieved_width + " " + retrieved_width)
  //       .attr("perserveAspectRatio", "xMinYMid")
  //       .call(resize);

  //   // to register multiple listeners for same event type, 
  //   // you need to add namespace, i.e., 'click.foo'
  //   // necessary if you call invoke this function for multiple svgs
  //   // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  //   d3.select(window).on("resize." + container.attr("id"), resize);
  // }

  // svg 
  //  .attr('height', canvasHeight)
  //  .attr('width', canvasWidth)
  //  .call(responsivefy)

  const container = d3.create('div')
     // .style('height', maxVizHeight)
     .style('width', maxVizWidth)
    .style('color', 'blue')
    // .attr('max-width', canvasWidth)
  const svg = container.append('svg')
  //   // Eventually would we want to do this just to the viz part, but also add the other stuff separately?
  // .attr('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`)
  .attr("width", "100%")
  .attr("height", "100%")
  .attr('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`)
  .style('font-family', 'sans-serif')
  .style('font-size', 12)

  // Credit to https://stackoverflow.com/questions/9400615/whats-the-best-way-to-make-a-d3-js-visualisation-layout-responsive
  const canvasAspect = canvasWidth / canvasHeight;
  d3.select(window)
   .on("resize", () => {
     let targetWidth = Math.min(maxVizWidth, svg.node().getBoundingClientRect().width);
     svg.attr("width", targetWidth);
     svg.attr("height", targetWidth / canvasAspect);
   });
  

  // ------------------------ Green inside-the-donut static stuff ------------------------
  const stroke_width = 14;
  const donut_donut = svg.append('g')
    .attr('transform', `translate(${width/2},${height/2})`)
  
  // Center ring
  donut_donut.append("circle")
    .attr('r', donut_center_radius)
    .attr('fill', 'transparent')
    .attr('stroke', light_green)
    .attr('stroke-width', (donut_outer_radius - donut_inner_radius));

  // "Ecological Ceiling" ring
  const ceilingRadius = donut_outer_radius - stroke_width/2;
  const ceilingStroke = donut_donut.append("circle")
    .attr('id', 'ecological_ceiling')
    .attr('r', ceilingRadius)
    .attr('fill', 'transparent')
    .attr('stroke', dark_green)
    .attr('stroke-width', stroke_width);
  const labelFontSize = 12;
  const labelHeight = labelFontSize * 0.7;
  const ceilingTextRadius = ceilingRadius - 0.5 * labelHeight;
  donut_donut.append("path")
    .attr('id', 'eco_ceiling_curve')
    .attr('d', `M-${ceilingTextRadius},0 A${ceilingTextRadius},${ceilingTextRadius} 0 0,1 ${ceilingTextRadius},0`)
    .attr('fill', 'none')
    .attr('opacity', 0.3)
  donut_donut.append("text") 
      .attr('font-family', 'sans-serif')
      .attr('font-size', labelFontSize)
      .attr('fill', 'white')
    .append("textPath")
      .attr('xlink:href', '#eco_ceiling_curve')
      .text("ECOLOGICAL CEILING")
      .attr('text-anchor', 'middle')
      .attr('startOffset', '50%')

  // "Social Foundation" ring
  const socialRadius = donut_inner_radius + stroke_width/2;
  const socialStroke = donut_donut.append("circle")
    .attr('id', 'social_foundation')
    .attr('r', socialRadius)
    .attr('fill', 'transparent') //hotpink for testing
    .attr('stroke', dark_green)
    .attr('stroke-width', stroke_width);
  const socialTextRadius = socialRadius - 0.5 * labelHeight;
  donut_donut.append("path")
    .attr('id', 'social_foundation_curve')
    .attr('d', `M-${socialTextRadius},0 A${socialTextRadius},${socialTextRadius} 0 0,1 ${socialTextRadius},0`)
    .attr('fill', 'transparent') //hotpink for testing
    .attr('opacity', 0.3)
  donut_donut.append("text") 
      .attr('font-family', 'sans-serif')
      .attr('font-size', labelFontSize)
      .attr('fill', 'white')
    .append("textPath")
      .attr('xlink:href', '#social_foundation_curve')
      .text("SOCIAL FOUNDATION")
      .attr('text-anchor', 'middle')
      .attr('startOffset', '50%')

  
  // ----------------------- Outer & Inner Data Driven Stuff -----------------------
  // How far do the red arcs go in or out
  const planet_outsideDonut_scale = d3.scaleLinear()
    .domain([100, 300]) 
    .range([planet_inner_radius, planet_outer_radius])
    .unknown(planet_outer_radius) // Null data is drawn at max -- also requires logic further down to use the outsideDonut scale 
    .clamp(true); // Cap the max
  
  const human_outsideDonut_scale = d3.scaleLinear()
    .domain([0, 99])
    .range([human_inner_radius, human_outer_radius - 1]);
    // Null data is drawn at 0 by default, no need to special-case that
  

  const planet_insideDonut_arc = d3.arc()
    .innerRadius(donut_center_radius + 1)
    .outerRadius(donut_outer_radius - stroke_width + 1) // TODO: sketchy pixel math?
    .padRadius(0.5 * planet_outer_radius)
    .padAngle(2/(0.65 * planet_outer_radius))
    .cornerRadius(0)
  const planet_outsideDonut_arc = d3.arc()
    .innerRadius(planet_inner_radius)
    .outerRadius(d => planet_outsideDonut_scale(d.data.percentage))
    .padRadius(0.5 * planet_outer_radius)
    .padAngle(2/(0.65 * planet_outer_radius))
    .cornerRadius(0)

  const human_insideDonut_arc = d3.arc()
    .innerRadius(donut_inner_radius + stroke_width - 1) // TODO: sketchy pixel math?
    .outerRadius(donut_center_radius - 1)
    .padRadius(0.5 * planet_outer_radius)
    .padAngle(2/(0.65 * planet_outer_radius))
    .cornerRadius(0)
  const human_outsideDonut_arc = d3.arc()
    .innerRadius(d => human_outsideDonut_scale(d.data.percentage === null? 0 : d.data.percentage))
    .outerRadius(human_outer_radius)
    .padRadius(0.5 * planet_outer_radius)
    .padAngle(2/(0.65 * planet_outer_radius))
    .cornerRadius(0)

  
  const planet_pie = d3.pie()
    .padAngle(0.00)
    .sort(null)
    .value(1) // Optional: value() sets value accessor that returns a numeric value for a given datum. 
              // So we want to make this constant to make the arc length constant -- only arc height should be variable.

  const human_pie = d3.pie()
    .padAngle(0.00)
    .sort(null)
    .value(1)

  // TODO: Standardize on terminology. "Outer/Inner" or "Planetary/Human" or "Ecological/Social" or "Ceiling/Foundation"
  const planet_data = response.data.filter(d => d.inner_or_outer == "Outer");
  const human_data = response.data.filter(d => d.inner_or_outer == "Inner");
  const planet_arcs = planet_pie(planet_data);
  const human_arcs = human_pie(human_data);
  
  const planet_donut = svg.append('g')
    .attr('transform', `translate(${width/2},${height/2})`)
  const human_donut = svg.append('g')
    .attr('transform', `translate(${width/2},${height/2})`)

  const isGoodForOuter = (value) => {
    // True = green = good ("within the donut") = 100 or less 
    return value === null ? null : value <= 100;
  }

  const planet_marks = planet_donut.selectAll('path')
    .data(planet_arcs)
    .join('path')
      .attr('fill', d => c(isGoodForOuter(d.data.percentage)))
      .attr('d', d => {
        const isGood = isGoodForOuter(d.data.percentage);
        return isGood === null || isGood === false ? planet_outsideDonut_arc(d) :  planet_insideDonut_arc(d)});
  

const isGoodForInner = (value) => {
  // True = green = good ("within the donut") = 100 or more
  return value === null ? null : value >= 100;
}
  
const human_marks = human_donut.selectAll('path')
    .data(human_arcs)
    .join('path')
      .attr('fill', d => c(isGoodForInner(d.data.percentage)))
      .attr('d', d => {
        const isGood = isGoodForInner(d.data.percentage);
        return isGood === null ? human_outsideDonut_arc(d) : 
          isGood ? human_insideDonut_arc(d) : 
          human_outsideDonut_arc(d)})

  
// ------------------ Text Labels for "Ecological Ceiling" categories from data ------------------
  const appendSvgTextIncludingNewlines = (text) => {
    text.each(function(d) {
      const textElement = d3.select(this);

      // Split the text into multiple lines
      const lines = d.data.category.split('\n');

      // Append each line as a <tspan>
      lines.forEach((line, i) => {
        textElement.append('tspan')
          .attr('x', 0)   // Keep text centered horizontally
          .attr('dy', i === 0 ? '0em' : '1em')  // Offset subsequent lines vertically
          .attr('font-weight', 'bold')  // First line bold
          .text(line);
      });
    });
  }
  
  const planet_default_text_arc = d3.arc()
    .innerRadius(planet_inner_radius)
    .outerRadius(planet_outer_radius)
    .padRadius(0.5 * planet_outer_radius)
    .padAngle(2/(0.65 * planet_outer_radius))
    .cornerRadius(0)
  const planet_labels = planet_donut.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
    .selectAll('text')
    .data(planet_arcs)
    .join('text')
      .attr('transform', d => `translate(${planet_default_text_arc.centroid(d)})`)
      .attr('id', d => d.data.category)
      .call(text => appendSvgTextIncludingNewlines(text))

// ----------------------- Text Labels for "Social Foundation" categories from data -----------------------
  // Use Google MUI Icons
  const makeMuiIcon = (text) => text.append('tspan')
       .attr("class", "human_label")
       .text(d => d.data.category_icon)

  const human_default_text_arc = d3.arc()
  .innerRadius(human_outer_radius + stroke_width)
  .outerRadius(donut_center_radius)
  // .innerRadius(human_outer_radius - 2*stroke_width)
  // .outerRadius(human_outer_radius - stroke_width)
  .padRadius(0.5 * human_outer_radius)
  .padAngle(2/(0.65 * human_inner_radius))
  .cornerRadius(0)
  const human_labels = human_donut.append('g')
    .attr('font-family', 'Material Symbols Outlined', 'sans-serif')
    .style('font-size', 26)
    //.attr('text-anchor', 'middle') // This messes it up on Safari
    .selectAll('text')
    .data(human_arcs)
    .join('text')
      .attr('transform', d => `translate(${human_default_text_arc.centroid(d)})`)
      .call((text) => {return makeMuiIcon(text).attr('y', '0.5em').attr('x', '-0.5em')})
  

 // ------------------------------------------- Legend --------------------------------------------
  const panelMargin = 10;
  const legendRowHeight = 27;
  const contentPadding = 5;
  const humanLegend_width = 200;
  const humanLegend_height = human_data.length * legendRowHeight + 20;
  let humanLegend_xOffset, humanLegend_yOffset
  const titleHeight = 20;


  if (boxesBelowViz) {
    humanLegend_xOffset = panelMargin;
    humanLegend_yOffset = height + panelMargin;
  } else {
    humanLegend_xOffset = width + panelMargin;
    humanLegend_yOffset = panelMargin;
  }

  const legend = svg 
    .append("g")
    .attr("transform", `translate(${humanLegend_xOffset},${humanLegend_yOffset})`)
    .attr("class", "legend");

  const rectangle = legend.append("rect")
    .attr("width", humanLegend_width)
    .attr("height", humanLegend_height)
    .attr("fill", "whitesmoke")

  legend.append("text")
    .text("SOCIAL FOUNDATION")
    .attr("y", 0)
    .style("font-size", 18)
    .style("font-weight", 'bold')

   const legendContent = legend.append("g")
    .selectAll("text")
    .data(human_data)
    .join("text")
    .attr("x", contentPadding)
    .attr("y", (d, i) => i * legendRowHeight + 20 + contentPadding)
    .attr("dy", 7)
    .call((text) => {text.append('tspan')
         .attr('font-family', 'Material Symbols Outlined', 'sans-serif')
         .style('font-size', 26)
         .text(d => d["category_icon"])})
  
  legend.append("g")
    .selectAll("text")
    .data(human_data)
    .join("text")
    .attr("x", 40)
    .attr("y", (d, i) => i * legendRowHeight + 20 + contentPadding)
    .text((d) => d["category"])
    .attr("fill", "grey");  

  
  
  // -------------------------------------- Side panel details box -----------------------------------------
  let sidePanelxOffset, sidePanelyOffset, sidePanelWidth, sidePanelHeight
  if (boxesBelowViz) {
    sidePanelxOffset = humanLegend_xOffset + humanLegend_width + panelMargin;
    sidePanelyOffset = height + panelMargin;
    sidePanelWidth = width - humanLegend_width - panelMargin;
    sidePanelHeight = canvasHeight - height - panelMargin*2;    
  } else {
    sidePanelxOffset = humanLegend_xOffset + humanLegend_width + panelMargin;
    sidePanelyOffset = panelMargin;
    sidePanelWidth = canvasWidth - sidePanelxOffset - panelMargin;
    sidePanelHeight = canvasHeight - panelMargin*2;  
  }

  const sidePanel = svg.append("foreignObject")
    .attr("id", "side-panel")
    .attr("width", sidePanelWidth)  // Set the width of the panel
    .attr("height", sidePanelHeight)  // Set the height of the panel
    .attr("x", sidePanelxOffset)
    .attr("y", sidePanelyOffset)
    .style("display", "none");
  const panelContent = sidePanel.append("xhtml:div")
    .attr("xmlns", "http://www.w3.org/1999/xhtml")  // Necessary for HTML inside SVG
    .style("width", sidePanelWidth)  // Set the width of the panel
    .style("height", sidePanelHeight)  // Set the height of the panel
    .style("background-color", "whitesmoke")  // Background color
    .style("overflow", "auto")
    .style("padding", "20px")
    .style("color", "black")

  // Add text elements for the icon, title, and description
  const topBar = panelContent.append("div")
    .style("display", "flex")
    .style("flex", 1)
    .style("align-items", "flex-start")
    .style("justify-content", "space-between");
  const title = topBar.append("div")
    .style("display", "flex")
    .style("align-items", "flex-start");
  const titleIcon = title.append("div")
  titleIcon.append('h2')
    .attr("id", "panel-icon")
    .attr('class', 'material-symbols-outlined')
    .style('font-size', 26)
  const titleText = title.append("div")
  titleText.append('h2')
    .attr("id", "panel-title")

  
  const closeButtonArea = 
  topBar.append("div")
  closeButtonArea.append("button")
    .attr("id", "close-panel")
    .style("font-size", "14px")
    .style("cursor", "pointer")
    .style('margin-left', '10px')
    .text("X")
    .on("click", function() {
      sidePanel.style("display", "none");});  // Hide the panel when close button clicked
  panelContent.append("p")
    .attr("id", "panel-details")
  panelContent.append("p")
    .attr("id", "panel-link")

    // ----------------------------- Outline marks on hover -----------------------------
  // - Outline marks
  //   - TODO: Give id's to marks and labels so that we can outline marks even when hovering on the label
  // FYI: append('title') is not compatible with getHoverText
  const getHoverText = (d) => {
    const hover_text = d.data.hover_text ?? ""
    const detail_msg = `${d.data.details ? "Click for more details" : ""}`
    return `${hover_text}\n\n${detail_msg}`;
  }
  
  const changeMarkOnMouseover = (event) => {
    const d = event.srcElement.__data__
    d3.select(event.currentTarget)
      .style("stroke", hover_outline)
      .style("stroke-width", 3)
      .append('title') 
        .text(getHoverText); 
  }
  const changeMarkOnMouseout = (event) => {
    const d = event.srcElement.__data__
    d3.select(event.currentTarget)
      //.attr("fill", c(isGoodForOuter(d.data.percentage)))
      // ^ would need to use different functions for inner/outer
      .style("stroke-width", 0);
  }

  const onTextMouseover = (event) => {
    d3.select(event.currentTarget).append('title').text(getHoverText);
  }
  
  planet_marks.on("mouseover", changeMarkOnMouseover).on("mouseout", changeMarkOnMouseout)
  human_marks.on("mouseover", changeMarkOnMouseover).on("mouseout", changeMarkOnMouseout)
  planet_labels.on("mouseover", onTextMouseover)
  human_labels.on("mouseover", onTextMouseover)
  
 
  // ----------------------------------- On click -----------------------------------
  const appendHtmlTextIncludingNewlines = (parentElement, text) => {
    if (text) {
      const lines = text.split("\n");
      lines.forEach(line => {
        parentElement.append("div").text(line);
      });
    }
  };
  
  const showDetailsPanel = (d) => {
    // Icon
    if (d["category_icon"]) {
      sidePanel.select("#panel-icon").text(d["category_icon"]).style('margin-right', '10px');
    } else {
      sidePanel.select("#panel-icon").text("").style('margin-right', '0px');
    }
    
    // Title
    sidePanel.select("#panel-title").text(d["category"] ?? "");
    
    // Details
    const panelDetails = sidePanel.select("#panel-details");
    panelDetails.selectAll("div").remove();
    appendHtmlTextIncludingNewlines(panelDetails, d["details"]);
    
    sidePanel.style("display", "block");

        // Link
        const panelLink = sidePanel.select("#panel-link");
        panelLink.selectAll("a").remove();
        if (d["link"]) {      
          panelLink.append("a")
          .attr("href", d["link"])
          .text("More info about this data")
          .attr("target", "_blank");
        }
  };

  const outlineMark = (id) => {
    // Remove the outline on any previously selected mark
    // Get the id of the label or mark or legend
    // Select the "mark-"+id
    const markId = '#mark-'+id;
    d3.select(markId)
      .style("stroke", "black")
      .style("stroke-width", 3)
  }
  
  const onMarkClick = (event) => {
    const d = event.srcElement.__data__.data
    console.log(event.srcElement);
    showDetailsPanel(d);
  }

  const onLabelClick = (event) => {
    
  }
  
  const onLegendClick = (event) => {
    const d = event.srcElement.__data__
    showDetailsPanel(d);
  }

  human_labels.style("cursor", "pointer").on("click", onMarkClick)
  planet_labels.style("cursor", "pointer").on("click", onMarkClick)
  human_marks.style("cursor", "pointer").on("click", onMarkClick)
  planet_marks.style("cursor", "pointer").on("click", onMarkClick)
  
  legendContent.style("cursor", "pointer").on("click", onLegendClick)

 
  
  return container.node()
}


function _8(md){return(
md`---`
)}

function _9(md){return(
md`<h2>References:</h2>  
For donut economics:  
https://goodlife.leeds.ac.uk/national-trends/country-trends/#USA  
https://doughnuteconomics.org/Creating-City-Portraits-Methodology.pdf

For d3 stuff:
https://www.d3-graph-gallery.com/donut.html  
https://observablehq.com/@d3/donut-chart  
https://observablehq.com/@nbremer/custom-cluster-force-layout`
)}

function _10(md){return(
md`---`
)}

async function _response(getCsvUrl,sheetInput,d3)
{
  try {
    const url = getCsvUrl(sheetInput);
    const data = await d3.csv(url, d3.autoType);
    console.log(`Running with modified URL = ${url}`); // TODO: remove this
    return {data: data};
  } 
  catch (error) {
    console.error("Error: Not a valid google doc with public viewing permissions");
    const defaultSheet = "https://docs.google.com/spreadsheets/d/17u5GECoGqdyKBz5xciyF_T2emLzwvgw4gaGn4l7atjg/edit?gid=0#gid=0";
    const oldDefaultSheet = "https://docs.google.com/spreadsheets/d/1CCFffe9HGeQidmh3Fuf-TZltFqDP8xq3RwHBPKZUGvA/edit?gid=27969826#gid=27969826";
    const data = await d3.csv(getCsvUrl(defaultSheet), d3.autoType);
    return {data: data, 
            errorHtml: "<p><b>Error</b>: Are you sure this is a valid google doc with public viewing permissions?<br>Using the example sheet in this case.</p>"};
  }
}


function _getCsvUrl(URLSearchParams){return(
url => {
    url = new URL(url);
    const id = url.pathname.split("/")[3]
    const gid = new URLSearchParams(url.hash.slice(1)).get("gid") || 0;
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`
  }
)}

function _d3(require){return(
require('d3@6')
)}

function __(require){return(
require('lodash')
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["htl"], _2);
  main.variable(observer()).define(["htl"], _3);
  main.variable(observer("viewof sheetInput")).define("viewof sheetInput", ["Inputs"], _sheetInput);
  main.variable(observer("sheetInput")).define("sheetInput", ["Generators", "viewof sheetInput"], (G, _) => G.input(_));
  main.variable(observer()).define(["htl"], _5);
  main.variable(observer()).define(["d3","sheetInput","response"], _6);
  main.variable(observer("chartSlope_v5")).define("chartSlope_v5", ["d3","response"], _chartSlope_v5);
  main.variable(observer()).define(["md"], _8);
  main.variable(observer()).define(["md"], _9);
  main.variable(observer()).define(["md"], _10);
  main.variable(observer("response")).define("response", ["getCsvUrl","sheetInput","d3"], _response);
  main.variable(observer("getCsvUrl")).define("getCsvUrl", ["URLSearchParams"], _getCsvUrl);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("_")).define("_", ["require"], __);
  return main;
}
