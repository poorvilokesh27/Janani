import React from 'react';
import { populationHealthCopy } from './populationHealth';

function HistoryChart({ title, series, years, unit, range = false }) {
  const nums = series.map((v) => range ? Number(v[0].split('–')[0]) : Number(v[0]));
  const max = Math.max(...nums) * 1.08;
  const min = Math.min(...nums) * 0.9;
  const points = nums.map((value, i) => `${46 + i * 76},${154 - ((value - min) / (max - min)) * 112}`).join(' ');
  return <article className="population-chart-card">
    <h3>{title}</h3>
    <svg className="population-history-chart" viewBox="0 0 560 190" role="img" aria-label={title}>
      {[0, 1, 2, 3].map((i) => <g key={i}><line x1="38" x2="540" y1={42 + i * 37} y2={42 + i * 37} /><text x="2" y={46 + i * 37}>{(max - ((max - min) * i / 3)).toFixed(1)}</text></g>)}
      <polyline points={points} />
      {nums.map((value, i) => <g key={years[i]}><circle cx={46 + i * 76} cy={154 - ((value - min) / (max - min)) * 112} r="4"/><text className="population-point-label" x={46 + i * 76} y={Math.max(22, 141 - ((value - min) / (max - min)) * 112)} textAnchor="middle">{range ? series[i][0].split('–')[0] : value.toFixed(3)}</text><text x={46 + i * 76} y="178" textAnchor="middle">{years[i]}</text></g>)}
      <text x="535" y="17" textAnchor="end">{unit}</text>
    </svg>
    {range && <small className="population-chart-note">The line shows the lower end of each supplied estimate range; see the table for the full range.</small>}
  </article>;
}

function MetricTable({ title, data, copy }) {
  return <section className="population-panel"><h3>{title}</h3><div className="population-table-wrap"><table className="population-table"><thead><tr><th>{copy.indicator}</th><th>{copy.estimate}</th></tr></thead><tbody>{data.map(([key, value]) => <tr key={key}><th scope="row">{key}</th><td>{value}</td></tr>)}</tbody></table></div></section>;
}

function TopicSection({ title, items }) {
  return <section className="period-education population-topics"><span className="section-kicker">{title}</span><div className="period-education-grid">{items.map(([heading, text]) => <article className="education-card" key={heading}><h4>{heading}</h4><p>{text}</p></article>)}</div></section>;
}

export default function PopulationHealthGuide({ language = 'en' }) {
  const copy = populationHealthCopy[language] || populationHealthCopy.en;
  const billion = language === 'kn' ? 'ಬಿಲಿಯನ್' : language === 'hi' ? 'अरब' : 'billion';
  return <div className="population-guide" lang={language}>
    <h2>{copy.title}</h2><p>{copy.intro}</p>
    <section className="period-education"><span className="section-kicker">{copy.history}</span><p>{copy.historyNote}</p>
      <div className="population-charts">
        <HistoryChart title={copy.chartIndia} years={copy.years} series={copy.indiaHistory} unit={language === 'kn' ? 'ಬಿಲಿಯನ್' : language === 'hi' ? 'अरब' : 'billion'} range />
        <HistoryChart title={copy.chartWorld} years={copy.years} series={copy.worldHistory} unit={language === 'kn' ? 'ಬಿಲಿಯನ್' : language === 'hi' ? 'अरब' : 'billion'} />
      </div>
      <div className="population-table-wrap"><table className="population-table"><thead><tr><th>{copy.year}</th><th>{copy.india} · {copy.population}</th><th>{copy.india} · {copy.growth}</th><th>{copy.world} · {copy.population}</th><th>{copy.world} · {copy.growth}</th></tr></thead><tbody>{copy.years.map((year, i) => <tr key={year}><th scope="row">{year}</th><td>{copy.indiaHistory[i][0]} {billion}</td><td>{copy.indiaHistory[i][1]}%</td><td>{copy.worldHistory[i][0]} {billion}</td><td>{copy.worldHistory[i][1]}%</td></tr>)}</tbody></table></div>
    </section>
    <div className="population-metrics"><MetricTable title={copy.india2026} data={copy.indiaMetrics} copy={copy}/><MetricTable title={copy.world2026} data={copy.worldMetrics} copy={copy}/></div>
    <TopicSection title={copy.trendsTitle} items={copy.trends}/>
    <TopicSection title={copy.indiaRegTitle} items={copy.indiaReg}/>
    <TopicSection title={copy.globalRegTitle} items={copy.globalReg}/>
    <TopicSection title={copy.maternalTitle} items={copy.maternal}/>
    <TopicSection title={copy.indiaMaternalTitle} items={copy.indiaMaternal}/>
    <p className="education-note population-disclaimer">{copy.disclaimer}</p>
    <p className="education-note population-sources">{copy.sources}: <a href="https://population.un.org/wpp/" target="_blank" rel="noreferrer">UN World Population Prospects</a> · <a href="https://www.who.int/news-room/fact-sheets/detail/maternal-mortality" target="_blank" rel="noreferrer">WHO maternal mortality</a> · <a href="https://www.who.int/news-room/fact-sheets/detail/newborn-mortality" target="_blank" rel="noreferrer">WHO newborn mortality</a> · <a href="https://censusindia.gov.in/nada/index.php/catalog/45564" target="_blank" rel="noreferrer">India Civil Registration System report</a> · <a href="https://www.unicef.org/india/newborn-and-child-health-1" target="_blank" rel="noreferrer">UNICEF India newborn health</a></p>
  </div>;
}
