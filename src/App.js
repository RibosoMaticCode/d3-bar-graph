import './App.css';
import * as d3 from 'd3';
import { useEffect, useState } from 'react'

function App() {

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const urlApi = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'

    setLoading(true)
    setError(null)

    d3.json(urlApi)
      .then(datos => {
        setData(datos.data);
        setLoading(false)
      })
      .catch(function (error) {
        setLoading(false)
        setError(error)
      });

  }, []);

  if( error ) <Error message={error.message} />

  return (
    <div className="main">
      <div className='container'>
        <h1 id="title" className='title'>Visualización de datos</h1>
        {loading ? 'Cargando...' : <Graph data={data} />}
      </div>
    </div>
  );
}

function Error(props){
  return(
    <div>Error: {props.message}</div>
  )
}

function Graph(props) {

  useEffect(() => {

    const allData = props.data;

    // separamos data:
    // data gross domestic product
    const dataGdp = allData.map( item => item[1] );

    // data date years
    const yearsDate = allData.map( item => new Date(item[0]) );

    // Lienzo
    const width = 800
    const height = 400
    const padding = 0
    const barWidth = width / 275

    const svg = d3.select(".graph-main")
      .append("svg")
      .attr("width", width + 100)
      .attr("height", height + 60)

    // Crear el dominio y rango:

    // scala x, para años
    const xMax = d3.max(yearsDate);
    const xScale = d3
      .scaleTime()
      .domain([d3.min(yearsDate), xMax])
      .range([0, width]);

    // scala valores de barras
    const linearScale = d3.scaleLinear()
      .domain([0, d3.max(dataGdp, (d) => d)])
      .range([0, height - padding]);

    // scala y, para eje x
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(dataGdp, (d) => d)])
      .range([height - padding, padding]);

    // tooltip
    const tooltip = d3
      .select('.graph-main')
      .append('div')
      .attr('id', 'tooltip')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // bars
    svg.selectAll("rect")
      .data(dataGdp)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr('index', (d, i) => i)
      .attr("width", barWidth)
      .attr("height", (d) => linearScale(d))
      .attr('x', function (d, i) {
        return xScale(yearsDate[i]);
      })
      .attr("y", (d) => height - linearScale(d))
      .attr("data-date", (d, i) => allData[i][0])
      .attr("data-gdp", (d) => d)
      .attr('transform', 'translate(60, 0)')
      .on('mouseover', function (event, d) {

        let i = this.getAttribute('index');
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip
          .html('Fecha:' + allData[i][0] + '<br />GPD:' + allData[i][1])
          .attr('data-date', allData[i][0])
          .style('left', i * barWidth + 30 + 'px')
          .style('top', height - 10 + 'px')
          .style('transform', 'translateX(60px)');
      })
      .on('mouseout', function () {
        tooltip.transition().duration(200).style('opacity', 0);
      });

    // ejes: x
    const xAxis = d3.axisBottom().scale(xScale);
    svg
      .append('g')
      .attr('id', 'x-axis')
      .attr('transform', 'translate(60, 400)')
      .call(xAxis)

    // ejes: y
    const yAxis = d3.axisLeft().scale(yScale)
    svg
      .append("g")
      .attr("transform", "translate(60,0)")
      .attr('id', 'y-axis')
      .call(yAxis)

  }, []);

  return (
    <div className='graph-main'></div>
  )
}

export default App;
