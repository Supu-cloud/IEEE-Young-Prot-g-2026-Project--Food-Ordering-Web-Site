/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'

export const money = (value:number) => `Rs. ${Math.round(value || 0).toLocaleString()}`
export const label = (value:string) => value.replaceAll('_',' ').replace(/\b\w/g,(letter)=>letter.toUpperCase())

export function AdminMetricCard({label:caption,value,note,icon}:{label:string;value:string|number;note?:string;icon:ReactNode}) {
  return <article className="admin-metric"><span>{icon}</span><div><small>{caption}</small><strong>{value}</strong>{note&&<em>{note}</em>}</div></article>
}
export function AdminChartCard({title,subtitle,action,children}:{title:string;subtitle?:string;action?:ReactNode;children:ReactNode}) {
  return <section className="portal-card admin-chart-card"><header><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action}</header>{children}</section>
}
export function AdminStatus({value}:{value:string}) { return <span className={`admin-status admin-status--${value.replaceAll('_','-')}`}>{label(value)}</span> }
export function AdminFilterBar({children}:{children:ReactNode}) { return <div className="admin-filter-bar">{children}</div> }
export function MiniBars({points,valueKey='revenue'}:{points:Array<Record<string,unknown>>;valueKey?:string}) {
  const max=Math.max(1,...points.map((point)=>Number(point[valueKey])||0))
  return <div className="admin-bars">{points.map((point,index)=><div key={String(point.date??index)} title={String(point[valueKey]??0)}><span style={{height:`${Math.max(4,(Number(point[valueKey])||0)/max*100)}%`}}/><small>{String(point.date??'').slice(-5)}</small></div>)}</div>
}
