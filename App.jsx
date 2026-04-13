import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabase'

// ============================================================
// GLOBAL STYLES
// ============================================================
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Bebas+Neue&display=swap');
    :root {
      --bg:#F3F4F6; --s1:#FFFFFF; --s2:#F9FAFB; --bd:#E5E7EB; --bd-dk:#D1D5DB;
      --pink:#E8215D; --pink2:#FF4F87; --grad:linear-gradient(135deg,#E8215D,#FF4F87);
      --t1:#111827; --t2:#374151; --t3:#6B7280;
      --ok:#16A34A; --ok-bg:#F0FDF4; --ok-bd:#BBF7D0;
      --shadow:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.05);
      --shadow-md:0 4px 16px rgba(0,0,0,.10);
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body,#root{min-height:100vh;background:var(--bg);color:var(--t1);
      font-family:'Nunito',sans-serif;font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--bd-dk);border-radius:4px}
    button{cursor:pointer;border:none;background:none;font-family:'Nunito',sans-serif}
    input{font-family:'Nunito',sans-serif;outline:none}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fu{animation:fadeUp .26s ease both}
    .su{animation:slideUp .32s cubic-bezier(.16,1,.3,1) both}
    button,a{-webkit-tap-highlight-color:transparent}
  `}</style>
)

// ============================================================
// EXERCISE DATABASE
// ============================================================
const MUSCLES = {
  chest:     { label:'Peito',    color:'#DB2777', bg:'#FDF2F8' },
  back:      { label:'Costas',   color:'#D97706', bg:'#FFFBEB' },
  shoulders: { label:'Ombros',   color:'#7C3AED', bg:'#F5F3FF' },
  arms:      { label:'Braços',   color:'#059669', bg:'#ECFDF5' },
  legs:      { label:'Pernas',   color:'#2563EB', bg:'#EFF6FF' },
  core:      { label:'Core',     color:'#CA8A04', bg:'#FEFCE8' },
}

const EX = [
  {id:1, name:'Supino Reto',               m:'chest',     a:'push',   eq:'Barra',         ds:4,dr:10},
  {id:2, name:'Supino Inclinado',           m:'chest',     a:'push',   eq:'Halteres',      ds:3,dr:12},
  {id:3, name:'Crucifixo',                  m:'chest',     a:'lateral',eq:'Halteres',      ds:3,dr:12},
  {id:4, name:'Crossover',                  m:'chest',     a:'lateral',eq:'Cabo',          ds:3,dr:15},
  {id:5, name:'Flexão',                     m:'chest',     a:'push',   eq:'Peso corporal', ds:3,dr:20},
  {id:6, name:'Levantamento Terra',         m:'back',      a:'hinge',  eq:'Barra',         ds:4,dr:6},
  {id:7, name:'Puxada Frontal',             m:'back',      a:'pullup', eq:'Máquina',       ds:4,dr:10},
  {id:8, name:'Remada Curvada',             m:'back',      a:'pullh',  eq:'Barra',         ds:4,dr:10},
  {id:9, name:'Barra Fixa',                 m:'back',      a:'pullup', eq:'Barra fixa',    ds:3,dr:8},
  {id:10,name:'Remada Unilateral',          m:'back',      a:'pullh',  eq:'Haltere',       ds:3,dr:12},
  {id:11,name:'Desenvolvimento',            m:'shoulders', a:'pushv',  eq:'Halteres',      ds:4,dr:10},
  {id:12,name:'Elevação Lateral',           m:'shoulders', a:'lateral',eq:'Halteres',      ds:3,dr:15},
  {id:13,name:'Elevação Frontal',           m:'shoulders', a:'pushv',  eq:'Halteres',      ds:3,dr:12},
  {id:14,name:'Remada Alta',                m:'shoulders', a:'pullh',  eq:'Barra',         ds:3,dr:12},
  {id:15,name:'Rosca Direta',               m:'arms',      a:'curl',   eq:'Barra',         ds:3,dr:12},
  {id:16,name:'Rosca Alternada',            m:'arms',      a:'curl',   eq:'Halteres',      ds:3,dr:12},
  {id:17,name:'Tríceps Testa',              m:'arms',      a:'pushv',  eq:'Barra EZ',      ds:3,dr:12},
  {id:18,name:'Tríceps Corda',              m:'arms',      a:'pushv',  eq:'Cabo',          ds:3,dr:15},
  {id:19,name:'Rosca Martelo',              m:'arms',      a:'curl',   eq:'Halteres',      ds:3,dr:12},
  {id:20,name:'Agachamento',                m:'legs',      a:'squat',  eq:'Barra',         ds:4,dr:8},
  {id:21,name:'Leg Press 45',               m:'legs',      a:'squat',  eq:'Máquina',       ds:4,dr:12},
  {id:22,name:'Avanço',                     m:'legs',      a:'lunge',  eq:'Halteres',      ds:3,dr:12},
  {id:23,name:'Cadeira Extensora',          m:'legs',      a:'curl',   eq:'Máquina',       ds:3,dr:15},
  {id:24,name:'Mesa Flexora',               m:'legs',      a:'curl',   eq:'Máquina',       ds:3,dr:15},
  {id:25,name:'Panturrilha',                m:'legs',      a:'calf',   eq:'Máquina',       ds:4,dr:20},
  {id:26,name:'Abdominal Crunch',           m:'core',      a:'crunch', eq:'Peso corporal', ds:3,dr:20},
  {id:27,name:'Prancha',                    m:'core',      a:'plank',  eq:'Peso corporal', ds:3,dr:'60s'},
  {id:28,name:'Russian Twist',              m:'core',      a:'rotation',eq:'Peso corporal',ds:3,dr:20},
  {id:29,name:'Elevação de Pernas',         m:'core',      a:'legraise',eq:'Peso corporal',ds:3,dr:15},
  {id:30,name:'Bicicleta',                  m:'core',      a:'crunch', eq:'Peso corporal', ds:3,dr:30},
  {id:31,name:'Remada Baixa c/ Triângulo',  m:'back',      a:'pullh',  eq:'Cabo',          ds:4,dr:12},
  {id:32,name:'Puxada Aberta',              m:'back',      a:'pullup', eq:'Máquina',       ds:4,dr:12},
  {id:33,name:'Supino Articulado',          m:'chest',     a:'push',   eq:'Máquina',       ds:4,dr:12},
  {id:34,name:'Cadeira Flexora',            m:'legs',      a:'curl',   eq:'Máquina',       ds:3,dr:15},
  {id:35,name:'Cadeira Adutora',            m:'legs',      a:'squat',  eq:'Máquina',       ds:3,dr:15},
  {id:36,name:'Cadeira Abdutora',           m:'legs',      a:'lateral',eq:'Máquina',       ds:3,dr:15},
  {id:37,name:'Panturrilha Sentado',        m:'legs',      a:'calf',   eq:'Máquina',       ds:4,dr:20},
  {id:38,name:'Elevação Frontal c/ Anilha', m:'shoulders', a:'pushv',  eq:'Anilha',        ds:3,dr:12},
  {id:39,name:'Elevação Lateral Halter',    m:'shoulders', a:'lateral',eq:'Halteres',      ds:3,dr:15},
]

const GOALS = {
  hipertrofia:   { label:'Hipertrofia',   icon:'💪', color:'#DB2777', restSec:75,
    desc:'Ganho de massa muscular',
    protocol:{ sets:'3–5 séries', reps:'8–12 reps',  rest:'60–90s', load:'65–80% 1RM' } },
  forca:         { label:'Força',          icon:'🏋️', color:'#2563EB', restSec:210,
    desc:'Desenvolvimento de força máxima',
    protocol:{ sets:'3–5 séries', reps:'3–6 reps',   rest:'3–5 min', load:'80–95% 1RM' } },
  emagrecimento: { label:'Emagrecimento',  icon:'🔥', color:'#059669', restSec:40,
    desc:'Queima de gordura e definição',
    protocol:{ sets:'3–4 séries', reps:'12–20 reps', rest:'30–45s',  load:'50–65% 1RM' } },
  resistencia:   { label:'Resistência',   icon:'⚡', color:'#CA8A04', restSec:45,
    desc:'Endurance e resistência muscular',
    protocol:{ sets:'2–3 séries', reps:'15–25 reps', rest:'30–60s',  load:'40–60% 1RM' } },
}

const SUGGESTIONS = {
  hipertrofia:[
    {exId:1, sets:4,reps:10,load:'70–75% 1RM',   tip:'Desça em 3 segundos para máximo estímulo'},
    {exId:20,sets:4,reps:10,load:'70% 1RM',       tip:'Paralelo ao chão — amplitude completa'},
    {exId:7, sets:4,reps:10,load:'Carga moderada',tip:'Retraia as escápulas no pico'},
    {exId:15,sets:3,reps:12,load:'65% 1RM',       tip:'Supine o pulso na contração máxima'},
    {exId:17,sets:3,reps:12,load:'60% 1RM',       tip:'Cotovelos fixos apontados para cima'},
    {exId:12,sets:3,reps:15,load:'Leve-moderado', tip:'Eleve até a altura dos ombros'},
  ],
  forca:[
    {exId:1, sets:5,reps:5, load:'80–85% 1RM',  tip:'5×5 clássico — técnica acima de tudo'},
    {exId:6, sets:4,reps:4, load:'85% 1RM',     tip:'Barra perto do corpo, core sempre ativo'},
    {exId:20,sets:5,reps:5, load:'80% 1RM',     tip:'Respire fundo antes de cada descida'},
    {exId:9, sets:4,reps:5, load:'+ Lastro',    tip:'Descida controlada em 3 segundos'},
    {exId:11,sets:4,reps:6, load:'75–80% 1RM',  tip:'Pressione acima da cabeça, core ativo'},
  ],
  emagrecimento:[
    {exId:20,sets:4,reps:15,load:'55% 1RM',    tip:'30s de descanso — sem parar'},
    {exId:5, sets:3,reps:20,load:'Peso corp.',  tip:'Execute em circuito sem parar'},
    {exId:22,sets:3,reps:16,load:'Haltere leve',tip:'Alterne as pernas continuamente'},
    {exId:26,sets:3,reps:25,load:'Peso corp.',  tip:'Velocidade máxima com controle'},
    {exId:30,sets:3,reps:30,load:'Peso corp.',  tip:'Ritmo acelerado para maior gasto'},
    {exId:25,sets:4,reps:20,load:'Moderado',    tip:'Amplitude total em cada repetição'},
  ],
  resistencia:[
    {exId:7, sets:3,reps:20,  load:'Carga leve',   tip:'Sem pausa entre repetições'},
    {exId:15,sets:3,reps:20,  load:'Leve-moderado',tip:'Tensão constante — nunca trave'},
    {exId:27,sets:3,reps:'45s',load:'Peso corp.',  tip:'Corpo reto da cabeça ao calcanhar'},
    {exId:29,sets:3,reps:20,  load:'Peso corp.',   tip:'Suba devagar, desça mais lento'},
    {exId:30,sets:3,reps:40,  load:'Peso corp.',   tip:'Ritmo constante, não pare'},
  ],
}

const COMP_A = ['squat','hinge','push','pullup','pullh','lunge']
const BODY_A  = ['crunch','plank','rotation','legraise','calf']
const calcKcal = (plan, kg=70, goal='hipertrofia') => {
  const rest = (GOALS[goal]||GOALS.hipertrofia).restSec
  let k = 0
  plan.exercises.forEach(({exId,sets}) => {
    const ex = EX.find(x=>x.id===exId); if(!ex) return
    const cat = COMP_A.includes(ex.a)?'c':BODY_A.includes(ex.a)?'b':'i'
    k += {c:5.5,b:3.5,i:4.0}[cat] * kg * (sets*({c:40,b:33,i:28}[cat]+rest)/3600)
  })
  return Math.round(k)
}
const calcMins = (plan, goal='hipertrofia') => {
  const rest = (GOALS[goal]||GOALS.hipertrofia).restSec
  let t = 0
  plan.exercises.forEach(({exId,sets}) => {
    const ex = EX.find(x=>x.id===exId); if(!ex) return
    const cat = COMP_A.includes(ex.a)?'c':BODY_A.includes(ex.a)?'b':'i'
    t += sets*({c:40,b:33,i:28}[cat]+rest)
  })
  return Math.round(t/60)
}

// ============================================================
// SUPABASE DB HELPERS
// ============================================================
const toAppPlan = p => ({
  id: p.id,
  name: p.name,
  exercises: (p.plan_exercises||[])
    .sort((a,b) => a.position - b.position)
    .map(e => ({ exId: e.exercise_id, sets: e.sets, reps: isNaN(e.reps)?e.reps:Number(e.reps) }))
})

async function dbLoadPlans(userId) {
  const { data, error } = await supabase
    .from('plans').select('*, plan_exercises(*)')
    .eq('user_id', userId).order('created_at', { ascending: true })
  if (error) throw error
  return (data||[]).map(toAppPlan)
}

async function dbSavePlan(plan, userId) {
  const isNew = !plan._dbId  // local plans don't have a DB UUID yet
  let planId = plan._dbId

  if (isNew) {
    const { data, error } = await supabase
      .from('plans').insert({ name: plan.name, user_id: userId }).select().single()
    if (error) throw error
    planId = data.id
  } else {
    await supabase.from('plans').update({ name: plan.name, updated_at: new Date().toISOString() }).eq('id', planId)
    await supabase.from('plan_exercises').delete().eq('plan_id', planId)
  }

  const rows = plan.exercises.map((e,i) => ({
    plan_id: planId,
    exercise_id: e.exId,
    exercise_name: EX.find(x=>x.id===e.exId)?.name || '',
    sets: e.sets,
    reps: String(e.reps),
    position: i,
  }))
  if (rows.length) await supabase.from('plan_exercises').insert(rows)

  return { ...plan, _dbId: planId, id: planId }
}

async function dbDeletePlan(dbId) {
  await supabase.from('plans').delete().eq('id', dbId)
}

async function dbStartSession(plan, userId, kcal) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ user_id:userId, plan_id:plan._dbId||plan.id, plan_name:plan.name,
      exercises_total: plan.exercises.length, kcal_estimate:kcal,
      started_at: new Date().toISOString() })
    .select().single()
  if (error) throw error
  return data.id
}

async function dbFinishSession(sessionId, done, total, mins) {
  await supabase.from('workout_sessions').update({
    exercises_done: done,
    finished_at: new Date().toISOString(),
    duration_minutes: mins,
  }).eq('id', sessionId)
}

async function dbLoadHistory(userId) {
  const { data, error } = await supabase
    .from('workout_sessions').select('*')
    .eq('user_id', userId).order('started_at', { ascending: false }).limit(30)
  if (error) throw error
  return data||[]
}

async function dbLoadProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

async function dbSaveProfile(userId, updates) {
  await supabase.from('profiles').upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
}

// ============================================================
// SVG ANIMATIONS
// ============================================================
const sk=c=>({stroke:c,strokeWidth:'2.5',strokeLinecap:'round',fill:'none'})
const H_=({c})=><circle cx="30" cy="9" r="7" {...sk(c)}/>
const Bd_=({c})=><line x1="30" y1="16" x2="30" y2="44" {...sk(c)}/>
const UL_=({c})=><line x1="30" y1="24" x2="12" y2="37" {...sk(c)}/>
const UR_=({c})=><line x1="30" y1="24" x2="48" y2="37" {...sk(c)}/>
const FL_=({c})=><line x1="12" y1="37" x2="9"  y2="51" {...sk(c)}/>
const FR_=({c})=><line x1="48" y1="37" x2="51" y2="51" {...sk(c)}/>
const TL_=({c})=><line x1="24" y1="44" x2="21" y2="62" {...sk(c)}/>
const TR_=({c})=><line x1="36" y1="44" x2="39" y2="62" {...sk(c)}/>
const SL_=({c})=><line x1="21" y1="62" x2="17" y2="78" {...sk(c)}/>
const SR_=({c})=><line x1="39" y1="62" x2="43" y2="78" {...sk(c)}/>
const Lg_=({c})=><><TL_ c={c}/><SL_ c={c}/><TR_ c={c}/><SR_ c={c}/></>
const Al_=({c})=><><H_ c={c}/><Bd_ c={c}/><UL_ c={c}/><FL_ c={c}/><UR_ c={c}/><FR_ c={c}/><Lg_ c={c}/></>
const NF_=({c})=><><H_ c={c}/><Bd_ c={c}/><UL_ c={c}/><UR_ c={c}/><Lg_ c={c}/></>
const NA_=({c})=><><H_ c={c}/><Bd_ c={c}/><Lg_ c={c}/></>
const NL_=({c})=><><H_ c={c}/><Bd_ c={c}/><UL_ c={c}/><FL_ c={c}/><UR_ c={c}/><FR_ c={c}/><TR_ c={c}/><SR_ c={c}/></>
const AT_=p=><animateTransform attributeName="transform" repeatCount="indefinite" {...p}/>
const SV_=({ch})=><svg viewBox="0 0 60 90" style={{width:'100%',height:'100%',overflow:'visible'}}>{ch}</svg>
const SW_=({ch})=><svg viewBox="0 0 88 56" style={{width:'100%',height:'100%',overflow:'visible'}}>{ch}</svg>

const A_Squat  =({c})=><SV_ ch={<g><AT_ type="translate" values="0,0;0,13;0,0" dur="2s"/><Al_ c={c}/></g>}/>
const A_Lunge  =({c})=><SV_ ch={<g><AT_ type="translate" values="0,0;0,9;0,0"  dur="2s"/><Al_ c={c}/></g>}/>
const A_Calf   =({c})=><SV_ ch={<g><AT_ type="translate" values="0,0;0,-9;0,0" dur="1.5s"/><Al_ c={c}/></g>}/>
const A_Pullup =({c})=><SV_ ch={<g><AT_ type="translate" values="0,0;0,-13;0,0" dur="2s"/><Al_ c={c}/></g>}/>
const A_Push   =({c})=><SV_ ch={<><NF_ c={c}/>
  <g><AT_ type="rotate" values="0 12 37;65 12 37;0 12 37" dur="1.5s"/><FL_ c={c}/></g>
  <g><AT_ type="rotate" values="0 48 37;-65 48 37;0 48 37" dur="1.5s"/><FR_ c={c}/></g></>}/>
const A_Pushv  =({c})=><SV_ ch={<><NA_ c={c}/>
  <g><AT_ type="rotate" values="0 30 24;80 30 24;0 30 24" dur="1.5s"/><UL_ c={c}/><FL_ c={c}/></g>
  <g><AT_ type="rotate" values="0 30 24;-80 30 24;0 30 24" dur="1.5s"/><UR_ c={c}/><FR_ c={c}/></g></>}/>
const A_Curl   =({c})=><SV_ ch={<><NF_ c={c}/>
  <g><AT_ type="rotate" values="0 12 37;115 12 37;0 12 37" dur="1.5s"/><FL_ c={c}/></g>
  <g><AT_ type="rotate" values="0 48 37;-115 48 37;0 48 37" dur="1.5s"/><FR_ c={c}/></g></>}/>
const A_Pullh  =({c})=><SV_ ch={<><NF_ c={c}/>
  <g><AT_ type="rotate" values="0 12 37;85 12 37;0 12 37" dur="1.8s"/><FL_ c={c}/></g>
  <g><AT_ type="rotate" values="0 48 37;-85 48 37;0 48 37" dur="1.8s"/><FR_ c={c}/></g></>}/>
const A_Lateral=({c})=><SV_ ch={<><NA_ c={c}/>
  <g><AT_ type="rotate" values="0 30 24;45 30 24;0 30 24" dur="1.5s"/><UL_ c={c}/><FL_ c={c}/></g>
  <g><AT_ type="rotate" values="0 30 24;-45 30 24;0 30 24" dur="1.5s"/><UR_ c={c}/><FR_ c={c}/></g></>}/>
const A_Hinge  =({c})=><SV_ ch={<>
  <g><AT_ type="rotate" values="0 30 44;40 30 44;0 30 44" dur="2s"/>
    <H_ c={c}/><Bd_ c={c}/><UL_ c={c}/><FL_ c={c}/><UR_ c={c}/><FR_ c={c}/></g><Lg_ c={c}/></>}/>
const A_Crunch =({c})=><SV_ ch={<>
  <g><AT_ type="translate" values="0,0;3,9;0,0" dur="1.5s"/>
    <H_ c={c}/><line x1="30" y1="16" x2="30" y2="34" {...sk(c)}/></g>
  <line x1="30" y1="34" x2="30" y2="44" {...sk(c)}/><UL_ c={c}/><FL_ c={c}/><UR_ c={c}/><FR_ c={c}/><Lg_ c={c}/></>}/>
const A_Plank  =({c})=><SW_ ch={<g {...sk(c)}>
  <AT_ type="translate" values="0,0;0,-3;0,0" dur="3s"/>
  <circle cx="76" cy="20" r="6"/>
  <line x1="70" y1="20" x2="14" y2="20"/>
  <line x1="56" y1="20" x2="53" y2="34"/><line x1="53" y1="34" x2="42" y2="34"/>
  <line x1="36" y1="20" x2="33" y2="34"/><line x1="33" y1="34" x2="22" y2="34"/>
  <line x1="14" y1="20" x2="5"  y2="20"/></g>}/>
const A_Rot    =({c})=><SV_ ch={<>
  <g><AT_ type="rotate" values="0 30 44;-22 30 44;22 30 44;-22 30 44;0 30 44" dur="2.5s"/>
    <H_ c={c}/><Bd_ c={c}/><UL_ c={c}/><FL_ c={c}/><UR_ c={c}/><FR_ c={c}/></g><Lg_ c={c}/></>}/>
const A_LegR   =({c})=><SV_ ch={<><NL_ c={c}/>
  <g><AT_ type="rotate" values="0 24 44;125 24 44;0 24 44" dur="2s"/><TL_ c={c}/><SL_ c={c}/></g></>}/>

const AMAP={squat:A_Squat,lunge:A_Lunge,calf:A_Calf,pullup:A_Pullup,push:A_Push,
  pushv:A_Pushv,curl:A_Curl,pullh:A_Pullh,lateral:A_Lateral,hinge:A_Hinge,
  crunch:A_Crunch,plank:A_Plank,rotation:A_Rot,legraise:A_LegR}
const ExAnim=({ak,color})=>{const C=AMAP[ak]||A_Push;return <C c={color}/>}

// ============================================================
// UI PRIMITIVES
// ============================================================
const Tag=({label,color,bg})=>(
  <span style={{display:'inline-flex',alignItems:'center',fontSize:12,fontWeight:700,
    padding:'3px 9px',borderRadius:99,background:bg||'#F3F4F6',color:color||'var(--t2)',
    letterSpacing:.2,whiteSpace:'nowrap'}}>{label}</span>
)

const PinkBtn=({children,onClick,disabled,size='md',style})=>{
  const pad={sm:'10px 16px',md:'14px 20px',lg:'16px 24px'}[size]
  const fs={sm:13,md:15,lg:16}[size]
  return(
    <button onClick={onClick} disabled={disabled} style={{
      width:'100%',padding:pad,fontSize:fs,fontWeight:800,
      background:disabled?'#E5E7EB':'var(--grad)',
      color:disabled?'#9CA3AF':'#fff',borderRadius:12,letterSpacing:.2,
      display:'flex',alignItems:'center',justifyContent:'center',gap:8,
      transition:'opacity .15s, transform .12s',
      boxShadow:disabled?'none':'0 4px 14px rgba(232,33,93,.35)',...style,
    }}
      onMouseDown={e=>{if(!disabled)e.currentTarget.style.transform='scale(.98)'}}
      onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
      {children}
    </button>
  )
}

const OutlineBtn=({children,onClick,style})=>(
  <button onClick={onClick} style={{
    width:'100%',padding:'13px 20px',fontSize:14,fontWeight:700,
    background:'var(--s1)',border:'1.5px solid var(--bd-dk)',color:'var(--t2)',borderRadius:12,
    display:'flex',alignItems:'center',justifyContent:'center',gap:8,
    transition:'background .15s, color .15s',...style,
  }}
    onMouseEnter={e=>{e.currentTarget.style.background='var(--bg)';e.currentTarget.style.color='var(--t1)'}}
    onMouseLeave={e=>{e.currentTarget.style.background='var(--s1)';e.currentTarget.style.color='var(--t2)'}}>
    {children}
  </button>
)

const Spinner=({size=24,color='var(--pink)'})=>(
  <div style={{width:size,height:size,border:`3px solid ${color}33`,
    borderTop:`3px solid ${color}`,borderRadius:'50%',
    animation:'spin 0.8s linear infinite',flexShrink:0}}/>
)

// ============================================================
// AUTH SCREEN (Magic Link)
// ============================================================
function AuthScreen() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const handleSend = async () => {
    if (!email.trim()) return
    setLoading(true); setError('')
    try {
      const redirectTo = window.location.origin
      const { error: e } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo }
      })
      if (e) throw e
      setSent(true)
    } catch(e) {
      setError(e.message || 'Erro ao enviar o link. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--s1)',display:'flex',
      flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px'}}>
      <GS/>
      {/* Logo */}
      <div style={{marginBottom:40,textAlign:'center'}}>
        <div style={{width:72,height:72,borderRadius:20,background:'var(--grad)',
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,
          boxShadow:'0 6px 24px rgba(232,33,93,.35)',margin:'0 auto 16px'}}>🏋️</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:2.5,
          background:'var(--grad)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          GYM TRACKER
        </div>
        <div style={{fontSize:14,color:'var(--t3)',marginTop:4,fontWeight:600}}>
          seus treinos, seu ritmo
        </div>
      </div>

      {sent ? (
        <div style={{width:'100%',maxWidth:360,textAlign:'center'}}>
          <div style={{fontSize:52,marginBottom:16}}>📬</div>
          <div style={{fontSize:18,fontWeight:800,color:'var(--t1)',marginBottom:8}}>
            Verifique seu e-mail!
          </div>
          <div style={{fontSize:14,color:'var(--t2)',lineHeight:1.7,marginBottom:24}}>
            Enviamos um link de acesso para<br/>
            <strong style={{color:'var(--pink)'}}>{email}</strong><br/>
            Clique no link para entrar.
          </div>
          <div style={{padding:'12px 16px',background:'#FFF0F4',border:'1px solid #FECDD3',
            borderRadius:12,fontSize:13,color:'#9F1239',fontWeight:600}}>
            Não recebeu? Verifique a pasta de spam.
          </div>
          <button onClick={()=>{setSent(false);setEmail('')}} style={{
            marginTop:20,color:'var(--t3)',fontSize:13,textDecoration:'underline'}}>
            Usar outro e-mail
          </button>
        </div>
      ) : (
        <div style={{width:'100%',maxWidth:360}}>
          <div style={{marginBottom:8,fontSize:14,fontWeight:700,color:'var(--t2)'}}>
            Seu e-mail
          </div>
          <input
            type="email"
            placeholder="nome@exemplo.com"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleSend()}
            style={{
              width:'100%',padding:'14px 16px',fontSize:16,fontWeight:500,
              background:'var(--bg)',border:'1.5px solid var(--bd-dk)',borderRadius:12,
              color:'var(--t1)',marginBottom:16,
            }}
            onFocus={e=>e.target.style.borderColor='var(--pink)'}
            onBlur={e=>e.target.style.borderColor='var(--bd-dk)'}
          />
          {error && (
            <div style={{padding:'10px 14px',background:'#FEF2F2',border:'1px solid #FECACA',
              borderRadius:10,color:'#DC2626',fontSize:13,fontWeight:600,marginBottom:12}}>
              {error}
            </div>
          )}
          <PinkBtn onClick={handleSend} disabled={loading||!email.trim()} size="lg">
            {loading ? <Spinner size={20} color="#fff"/> : '✉️ Enviar link de acesso'}
          </PinkBtn>
          <div style={{textAlign:'center',marginTop:16,fontSize:12,color:'var(--t3)',lineHeight:1.6}}>
            Sem senha — você recebe um link seguro por e-mail.<br/>
            Clique no link e você já entra automaticamente.
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// EXERCISE CARD
// ============================================================
const ExCard=({ex,compact=false,sel=false,onClick,delay=0})=>{
  const m=MUSCLES[ex.m]
  return(
    <div onClick={onClick} className="fu" style={{
      background:sel?'#FFF0F4':'var(--s1)',border:`1.5px solid ${sel?'var(--pink)':'var(--bd)'}`,
      borderRadius:14,padding:compact?'12px 14px':'16px',
      cursor:onClick?'pointer':'default',display:'flex',alignItems:'center',gap:14,
      transition:'border-color .18s, box-shadow .18s',
      boxShadow:sel?'0 0 0 3px rgba(232,33,93,.12)':'var(--shadow)',
      animationDelay:`${delay}s`,
    }}>
      <div style={{width:compact?44:56,height:compact?44:56,flexShrink:0,
        background:m.bg,borderRadius:10,padding:compact?4:6}}>
        <ExAnim ak={ex.a} color={m.color}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:compact?14:15,color:'var(--t1)',marginBottom:5,
          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ex.name}</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
          <Tag label={m.label} color={m.color} bg={m.bg}/>
          <span style={{fontSize:13,color:'var(--t3)'}}>{ex.eq}</span>
        </div>
      </div>
      {sel&&<div style={{width:26,height:26,borderRadius:13,background:'var(--grad)',
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:13,color:'#fff',fontWeight:800,flexShrink:0}}>✓</div>}
    </div>
  )
}

// ============================================================
// PLAN CARD
// ============================================================
const PlanCard=({plan,idx,weight,goal,onPlay,onEdit,onDelete,saving})=>{
  const exCount=plan.exercises.length
  const totalSets=plan.exercises.reduce((s,e)=>s+e.sets,0)
  const muscles=[...new Set(plan.exercises.map(e=>EX.find(x=>x.id===e.exId)?.m).filter(Boolean))]
  const kcal=calcKcal(plan,weight,goal)
  const mins=calcMins(plan,goal)

  return(
    <div className="fu" style={{background:'var(--s1)',border:'1.5px solid var(--bd)',
      borderRadius:18,overflow:'hidden',boxShadow:'var(--shadow)',animationDelay:`${idx*.07}s`}}>
      <div style={{height:4,background:'var(--grad)'}}/>
      <div style={{padding:'20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:.5,color:'var(--t1)',
            flex:1,paddingRight:12,lineHeight:1.15}}>{plan.name}</div>
          <div style={{display:'flex',gap:6,flexShrink:0}}>
            {saving&&<Spinner size={18}/>}
            <button onClick={onEdit} title="Editar" style={{
              width:36,height:36,borderRadius:9,background:'var(--bg)',
              border:'1.5px solid var(--bd)',color:'var(--t3)',fontSize:14,
              display:'flex',alignItems:'center',justifyContent:'center',transition:'all .18s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--pink)';e.currentTarget.style.color='var(--pink)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd)';e.currentTarget.style.color='var(--t3)'}}>✏️</button>
            <button onClick={onDelete} title="Excluir" style={{
              width:36,height:36,borderRadius:9,background:'var(--bg)',
              border:'1.5px solid var(--bd)',color:'var(--t3)',fontSize:13,
              display:'flex',alignItems:'center',justifyContent:'center',transition:'all .18s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#FCA5A5';e.currentTarget.style.background='#FEF2F2';e.currentTarget.style.color='#DC2626'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd)';e.currentTarget.style.background='var(--bg)';e.currentTarget.style.color='var(--t3)'}}>🗑</button>
          </div>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
          {[['💪',`${exCount} exercícios`],['🔁',`${totalSets} séries`],['⏱',`~${mins} min`]].map(([ic,v])=>(
            <div key={v} style={{display:'flex',alignItems:'center',gap:5,
              padding:'5px 10px',background:'var(--bg)',borderRadius:8,border:'1px solid var(--bd)'}}>
              <span style={{fontSize:13}}>{ic}</span>
              <span style={{fontSize:13,fontWeight:600,color:'var(--t2)'}}>{v}</span>
            </div>
          ))}
          <div style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',borderRadius:8,
            background:'#FFF0F4',border:'1px solid #FECDD3'}}>
            <span style={{fontSize:13}}>🔥</span>
            <span style={{fontSize:13,fontWeight:800,color:'var(--pink)'}}>~{kcal} kcal</span>
          </div>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
          {muscles.map(m=>{const mu=MUSCLES[m];return<Tag key={m} label={mu.label} color={mu.color} bg={mu.bg}/>})}
        </div>
        <div style={{display:'flex',gap:6,marginBottom:18,flexWrap:'wrap'}}>
          {plan.exercises.slice(0,7).map(e=>{
            const ex=EX.find(x=>x.id===e.exId);if(!ex)return null
            const m=MUSCLES[ex.m]
            return<div key={e.exId} title={ex.name}
              style={{width:34,height:34,background:m.bg,borderRadius:8,padding:4,border:`1px solid ${m.color}22`}}>
              <ExAnim ak={ex.a} color={m.color}/>
            </div>
          })}
          {exCount>7&&<div style={{width:34,height:34,background:'var(--bg)',borderRadius:8,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,
            fontWeight:700,color:'var(--t3)',border:'1px solid var(--bd)'}}>+{exCount-7}</div>}
        </div>
        <PinkBtn onClick={onPlay} size="md">▶ Iniciar Treino</PinkBtn>
      </div>
    </div>
  )
}

// ============================================================
// WORKOUT PLAYER (records session to Supabase)
// ============================================================
function WorkoutPlayer({plan, user, goal, weight, onClose}) {
  const planExs = plan.exercises.map(e=>({...e,ex:EX.find(x=>x.id===e.exId)})).filter(e=>e.ex)
  const total   = planExs.length
  const kcal    = calcKcal(plan, weight, goal)
  const startRef = useRef(Date.now())
  const sessionRef = useRef(null)

  const [done,     setDone]     = useState(new Set())
  const [finished, setFinished] = useState(false)

  // Start session in Supabase when component mounts
  useEffect(() => {
    if (user) {
      dbStartSession(plan, user.id, kcal)
        .then(id => { sessionRef.current = id })
        .catch(console.error)
    }
  }, [])

  const toggle = i => {
    setDone(prev => {
      const s = new Set(prev)
      if (s.has(i)) s.delete(i); else s.add(i)
      return s
    })
  }

  const handleFinish = async () => {
    const mins = Math.round((Date.now() - startRef.current) / 60000)
    if (user && sessionRef.current) {
      await dbFinishSession(sessionRef.current, done.size, total, mins).catch(console.error)
    }
    setFinished(true)
  }

  const allDone = done.size === total
  const progress = (done.size / total) * 100

  if (finished) return (
    <div className="su" style={{position:'fixed',inset:0,background:'var(--s1)',zIndex:400,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      gap:24,padding:32,textAlign:'center'}}>
      <GS/>
      <div style={{fontSize:80}}>🏆</div>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:48,letterSpacing:2,lineHeight:1,
        background:'var(--grad)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
        TREINO CONCLUÍDO!
      </div>
      <div style={{fontSize:16,color:'var(--t2)',lineHeight:1.7}}>
        {done.size} de {total} exercícios concluídos<br/>
        <span style={{fontWeight:800,color:'var(--pink)'}}>Ótimo trabalho! 💪</span>
      </div>
      <div style={{width:'100%',maxWidth:300,marginTop:8}}>
        <PinkBtn onClick={onClose} size="lg">Fechar</PinkBtn>
      </div>
    </div>
  )

  return (
    <div className="su" style={{position:'fixed',inset:0,background:'var(--bg)',zIndex:400,
      display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <GS/>
      {/* Header */}
      <div style={{background:'var(--s1)',borderBottom:'1.5px solid var(--bd)',
        boxShadow:'var(--shadow)',flexShrink:0}}>
        <div style={{padding:'16px 20px',display:'flex',alignItems:'center',gap:14}}>
          <button onClick={onClose} style={{width:40,height:40,borderRadius:10,background:'var(--bg)',
            border:'1.5px solid var(--bd)',color:'var(--t2)',fontSize:18,
            display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:.5,
              overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{plan.name}</div>
            <div style={{fontSize:13,color:'var(--t3)',fontWeight:600}}>
              {done.size} de {total} exercícios concluídos
            </div>
          </div>
          <div style={{position:'relative',width:44,height:44,flexShrink:0}}>
            <svg width={44} height={44} viewBox="0 0 44 44">
              <circle cx={22} cy={22} r={18} fill="none" stroke="#E5E7EB" strokeWidth={4}/>
              <circle cx={22} cy={22} r={18} fill="none" stroke="var(--pink)" strokeWidth={4}
                strokeDasharray={2*Math.PI*18}
                strokeDashoffset={2*Math.PI*18*(1-progress/100)}
                strokeLinecap="round" transform="rotate(-90 22 22)"
                style={{transition:'stroke-dashoffset .4s ease'}}/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',
              justifyContent:'center',fontSize:11,fontWeight:800,color:'var(--t1)'}}>
              {Math.round(progress)}%
            </div>
          </div>
        </div>
        <div style={{height:3,background:'var(--bd)'}}>
          <div style={{height:'100%',background:'var(--grad)',width:`${progress}%`,
            transition:'width .4s ease'}}/>
        </div>
        <div style={{padding:'10px 20px',background:'#FFF0F4',borderTop:'1px solid #FECDD3',
          fontSize:13,color:'#9F1239',fontWeight:600,display:'flex',alignItems:'center',gap:7}}>
          <span>💡</span>
          <span>Toque em "Concluir" para marcar — qualquer ordem, pule e volte quando quiser</span>
        </div>
      </div>

      {/* Exercise list */}
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:10}}>
        {planExs.map((e,i)=>{
          const isDone=done.has(i)
          const m=MUSCLES[e.ex.m]
          return(
            <div key={i} style={{background:'var(--s1)',
              border:`1.5px solid ${isDone?'var(--pink)':'var(--bd)'}`,
              borderRadius:16,overflow:'hidden',
              boxShadow:isDone?'0 0 0 3px rgba(232,33,93,.1)':'var(--shadow)',
              transition:'all .2s'}}>
              <div style={{padding:'16px',display:'flex',alignItems:'center',gap:14}}>
                <div style={{width:56,height:56,flexShrink:0,
                  background:isDone?'#FFF0F4':m.bg,borderRadius:12,padding:6,
                  border:`1px solid ${isDone?'var(--pink)22':m.color+'22'}`,transition:'background .2s'}}>
                  <ExAnim ak={e.ex.a} color={isDone?'var(--pink)':m.color}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:15,
                    color:isDone?'var(--t3)':'var(--t1)',
                    textDecoration:isDone?'line-through':'none',
                    marginBottom:5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {e.ex.name}
                  </div>
                  <div style={{display:'flex',gap:7,flexWrap:'wrap',alignItems:'center'}}>
                    <span style={{fontSize:14,fontWeight:800,color:isDone?'var(--t3)':'var(--t1)'}}>
                      {e.sets} séries × {e.reps}{typeof e.reps==='number'?' reps':''}
                    </span>
                    <Tag label={m.label} color={isDone?'var(--t3)':m.color} bg={isDone?'var(--bg)':m.bg}/>
                  </div>
                  <div style={{fontSize:13,color:'var(--t3)',marginTop:3}}>{e.ex.eq}</div>
                </div>
                <button onClick={()=>toggle(i)} style={{
                  flexShrink:0,padding:'10px 14px',borderRadius:10,fontWeight:800,fontSize:13,
                  background:isDone?'#FFF0F4':'var(--grad)',
                  color:isDone?'var(--pink)':'#fff',
                  border:`1.5px solid ${isDone?'var(--pink)':'transparent'}`,
                  boxShadow:isDone?'none':'0 2px 8px rgba(232,33,93,.3)',
                  transition:'all .2s',whiteSpace:'nowrap',
                  display:'flex',alignItems:'center',gap:6}}>
                  {isDone?<>✓ Feito</>:<><span style={{fontSize:15}}>○</span> Concluir</>}
                </button>
              </div>
            </div>
          )
        })}
        <div style={{height:16}}/>
      </div>

      {/* Finish bar */}
      {done.size>0&&(
        <div style={{padding:'14px 20px 20px',background:'var(--s1)',
          borderTop:'1.5px solid var(--bd)',boxShadow:'0 -4px 16px rgba(0,0,0,.07)',flexShrink:0}}>
          <PinkBtn onClick={handleFinish} size="lg">
            {allDone?'🏆 Finalizar treino':`Encerrar treino (${done.size}/${total} feitos)`}
          </PinkBtn>
          {!allDone&&<div style={{fontSize:13,color:'var(--t3)',textAlign:'center',marginTop:8,fontWeight:500}}>
            Você pode encerrar agora e voltar ao que pulou depois
          </div>}
        </div>
      )}
    </div>
  )
}

// ============================================================
// PLAN MODAL
// ============================================================
function PlanModal({onSave, onClose, editing=null, prefill=null}) {
  const [step,    setStep]    = useState(1)
  const [name,    setName]    = useState(editing?.name||prefill?.name||'')
  const [sel,     setSel]     = useState(editing?editing.exercises.map(e=>e.exId):(prefill?.exercises.map(e=>e.exId)||[]))
  const [cfgs,    setCfgs]    = useState(()=>{
    const src=editing||prefill
    return src?Object.fromEntries(src.exercises.map(e=>[e.exId,{sets:e.sets,reps:e.reps}])):{}
  })
  const [mf,      setMf]      = useState(null)
  const [focused, setFocused] = useState(false)

  const toggle=id=>{
    setSel(prev=>{
      if(prev.includes(id))return prev.filter(x=>x!==id)
      const ex=EX.find(x=>x.id===id)
      setCfgs(c=>({...c,[id]:{sets:ex.ds,reps:ex.dr}}))
      return[...prev,id]
    })
  }
  const move=(idx,dir)=>{
    setSel(prev=>{const a=[...prev],ni=idx+dir
      if(ni<0||ni>=a.length)return a;[a[idx],a[ni]]=[a[ni],a[idx]];return a})
  }
  const upd=(id,f,v)=>setCfgs(c=>({...c,[id]:{...(c[id]||{sets:3,reps:12}),[f]:Math.max(1,v)}}))
  const canGo=name.trim().length>0&&sel.length>0
  const fex=mf?EX.filter(e=>e.m===mf):EX

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(17,24,39,.6)',zIndex:300,
      display:'flex',flexDirection:'column',justifyContent:'flex-end'}}
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <GS/>
      <div className="su" style={{background:'var(--s1)',borderRadius:'24px 24px 0 0',
        maxHeight:'94vh',display:'flex',flexDirection:'column',overflow:'hidden',
        boxShadow:'0 -8px 40px rgba(0,0,0,.15)'}}>
        {/* Header */}
        <div style={{padding:'20px 22px 16px',borderBottom:'1.5px solid var(--bd)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
            {[1,2].map(n=>(
              <div key={n} style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:28,height:28,borderRadius:14,display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:13,fontWeight:800,
                  background:step>=n?'var(--grad)':'var(--bg)',
                  color:step>=n?'#fff':'var(--t3)',
                  border:step>=n?'none':'1.5px solid var(--bd)'}}>
                  {step>n?'✓':n}
                </div>
                <span style={{fontSize:13,fontWeight:700,color:step===n?'var(--t1)':'var(--t3)'}}>
                  {n===1?'Exercícios':'Séries & ordem'}
                </span>
                {n<2&&<div style={{width:24,height:2,borderRadius:1,
                  background:step>1?'var(--grad)':'var(--bd)'}}/>}
              </div>
            ))}
            <div style={{flex:1}}/>
            <button onClick={onClose} style={{width:34,height:34,borderRadius:17,
              background:'var(--bg)',border:'1.5px solid var(--bd)',
              color:'var(--t2)',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          </div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:26,letterSpacing:.5,color:'var(--t1)'}}>
            {editing?'Editar Treino':step===1?'Criar Novo Treino':'Configurar exercícios'}
          </div>
          <div style={{fontSize:13,color:'var(--t3)',marginTop:3,fontWeight:500}}>
            {step===1?`${sel.length} selecionado${sel.length!==1?'s':''} — toque para adicionar`
              :'Ajuste séries, reps e a ordem com ↑↓'}
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
          {step===1&&(<>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:13,fontWeight:700,color:'var(--t2)',display:'block',marginBottom:8}}>
                Nome do treino *
              </label>
              <input value={name} onChange={e=>setName(e.target.value)}
                placeholder="Ex: Treino A — Pernas"
                onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
                style={{width:'100%',background:'var(--s1)',
                  border:`1.5px solid ${focused?'var(--pink)':'var(--bd-dk)'}`,
                  borderRadius:12,padding:'13px 15px',color:'var(--t1)',fontSize:15,fontWeight:500,
                  boxShadow:focused?'0 0 0 3px rgba(232,33,93,.1)':'none'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <label style={{fontSize:13,fontWeight:700,color:'var(--t2)'}}>Exercícios *</label>
              {sel.length>0&&<span style={{fontSize:13,fontWeight:800,color:'var(--pink)'}}>
                {sel.length} selecionado{sel.length!==1?'s':''}
              </span>}
            </div>
            <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',paddingBottom:4}}>
              {[['','Todos'],...Object.entries(MUSCLES).map(([k,v])=>[k,v.label])].map(([k,l])=>{
                const mu=k?MUSCLES[k]:null; const active=mf===(k||null)
                return<button key={k} onClick={()=>setMf(k||null)} style={{
                  padding:'7px 14px',borderRadius:20,fontSize:13,fontWeight:700,flexShrink:0,
                  background:active?(mu?mu.bg:'#F9FAFB'):'var(--s1)',
                  color:active?(mu?mu.color:'var(--t1)'):'var(--t2)',
                  border:`1.5px solid ${active?(mu?mu.color+'55':'var(--bd-dk)'):'var(--bd)'}`,
                  transition:'all .18s'}}>
                  {l}
                </button>
              })}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {fex.map((ex,i)=><ExCard key={ex.id} ex={ex} compact sel={sel.includes(ex.id)}
                onClick={()=>toggle(ex.id)} delay={i*.02}/>)}
            </div>
          </>)}

          {step===2&&(<>
            <div style={{padding:'12px 14px',background:'#EFF6FF',borderRadius:10,
              border:'1px solid #BFDBFE',marginBottom:16,fontSize:13,color:'#1D4ED8',fontWeight:600}}>
              💡 Use ↑↓ para definir a ordem dos exercícios no treino
            </div>
            {sel.map((id,idx)=>{
              const ex=EX.find(x=>x.id===id)
              const cfg=cfgs[id]||{sets:3,reps:12}
              const m=MUSCLES[ex.m]
              return(
                <div key={id} style={{background:'var(--s1)',border:'1.5px solid var(--bd)',
                  borderRadius:16,padding:'16px',marginBottom:10,boxShadow:'var(--shadow)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      {[[-1,'↑'],[1,'↓']].map(([d,ic])=>{
                        const dis=d===-1?idx===0:idx===sel.length-1
                        return<button key={d} onClick={()=>move(idx,d)} disabled={dis} style={{
                          width:26,height:26,borderRadius:7,fontSize:13,fontWeight:700,
                          background:dis?'transparent':'var(--bg)',color:dis?'var(--bd-dk)':'var(--t2)',
                          border:`1.5px solid ${dis?'var(--bd)':'var(--bd-dk)'}`,
                          display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {ic}
                        </button>
                      })}
                    </div>
                    <div style={{width:26,height:26,borderRadius:8,background:m.bg,display:'flex',
                      alignItems:'center',justifyContent:'center',fontSize:12,color:m.color,fontWeight:800,flexShrink:0}}>
                      {idx+1}
                    </div>
                    <div style={{width:42,height:42,background:m.bg,borderRadius:10,padding:4,flexShrink:0}}>
                      <ExAnim ak={ex.a} color={m.color}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {ex.name}
                      </div>
                      <div style={{display:'flex',gap:5,marginTop:4}}>
                        <Tag label={m.label} color={m.color} bg={m.bg}/>
                        <span style={{fontSize:12,color:'var(--t3)',alignSelf:'center'}}>{ex.eq}</span>
                      </div>
                    </div>
                    <button onClick={()=>setSel(p=>p.filter(x=>x!==id))} style={{
                      width:28,height:28,borderRadius:8,background:'var(--bg)',
                      border:'1.5px solid var(--bd)',color:'var(--t3)',fontSize:12,
                      display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    {[['sets','Séries'],['reps','Repetições']].map(([f,lbl])=>(
                      <div key={f} style={{flex:1,background:'var(--bg)',borderRadius:12,padding:'12px 14px',
                        border:'1px solid var(--bd)'}}>
                        <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',letterSpacing:.3,marginBottom:10}}>
                          {lbl.toUpperCase()}
                        </div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          {[[(cfg[f]||1)-1,'−'],[(cfg[f]||0)+1,'+']].map(([val,ic],bi)=>(
                            <button key={bi} onClick={()=>upd(id,f,val)} style={{
                              width:36,height:36,borderRadius:9,background:'var(--s1)',
                              border:'1.5px solid var(--bd-dk)',color:'var(--t2)',fontSize:20,fontWeight:700,
                              display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}
                              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--pink)';e.currentTarget.style.color='var(--pink)'}}
                              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd-dk)';e.currentTarget.style.color='var(--t2)'}}>
                              {ic}
                            </button>
                          ))}
                          <span style={{fontSize:24,fontWeight:900,color:'var(--t1)',minWidth:30,textAlign:'center'}}>
                            {cfg[f]||0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </>)}
        </div>

        <div style={{padding:'16px 22px 20px',borderTop:'1.5px solid var(--bd)',
          display:'flex',gap:10,background:'var(--s1)'}}>
          {step===2&&<OutlineBtn onClick={()=>setStep(1)} style={{flex:'none',width:'auto',padding:'13px 20px'}}>
            ← Voltar
          </OutlineBtn>}
          <PinkBtn disabled={!canGo} onClick={step===1?()=>{if(canGo)setStep(2)}:()=>{
            if(!name.trim()||sel.length===0) return
            onSave({name:name.trim(),_dbId:editing?._dbId,
              exercises:sel.map(id=>({exId:id,...(cfgs[id]||{sets:3,reps:12})}))})
          }}>
            {step===1
              ?(canGo?`Próximo: configurar ${sel.length} exercício${sel.length!==1?'s':''} →`:'Selecione ao menos 1 exercício')
              :(editing?'Salvar alterações':'✓ Criar treino')}
          </PinkBtn>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SUGGESTIONS
// ============================================================
function SuggestionsPanel({onCreateFromGoal}) {
  const [ag, setAg] = useState('hipertrofia')
  const g=GOALS[ag], suggs=SUGGESTIONS[ag]||[]
  return(<>
    <div style={{display:'flex',gap:8,marginBottom:20,overflowX:'auto',paddingBottom:2}}>
      {Object.entries(GOALS).map(([k,v])=>(
        <button key={k} onClick={()=>setAg(k)} style={{
          padding:'10px 16px',borderRadius:12,fontSize:13,fontWeight:700,flexShrink:0,
          background:ag===k?v.color+'18':'var(--s1)',color:ag===k?v.color:'var(--t2)',
          border:`1.5px solid ${ag===k?v.color+'44':'var(--bd)'}`,
          boxShadow:ag===k?'var(--shadow)':'none',transition:'all .2s'}}>
          {v.icon} {v.label}
        </button>
      ))}
    </div>
    <div style={{background:'var(--s1)',border:`1.5px solid ${g.color}33`,borderRadius:18,
      padding:'20px',marginBottom:20,boxShadow:'var(--shadow)'}}>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:24,letterSpacing:.5,color:g.color,marginBottom:4}}>
        {g.icon} {g.label}
      </div>
      <div style={{fontSize:15,color:'var(--t2)',marginBottom:16,lineHeight:1.5}}>{g.desc}</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {[['🔁',g.protocol.sets],['📊',g.protocol.reps],['⏱',g.protocol.rest],['⚖️',g.protocol.load]].map(([ic,v])=>(
          <div key={v} style={{padding:'7px 12px',background:'var(--bg)',borderRadius:9,
            border:'1px solid var(--bd)',fontSize:13,fontWeight:600,color:'var(--t2)',
            display:'flex',gap:6,alignItems:'center'}}>
            <span>{ic}</span><span>{v}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={{fontSize:13,fontWeight:700,color:'var(--t3)',letterSpacing:.4,marginBottom:12}}>
      EXERCÍCIOS RECOMENDADOS
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
      {suggs.map((s,i)=>{
        const ex=EX.find(x=>x.id===s.exId);if(!ex)return null
        const m=MUSCLES[ex.m]
        return(
          <div key={i} className="fu" style={{background:'var(--s1)',border:'1.5px solid var(--bd)',
            borderRadius:16,overflow:'hidden',boxShadow:'var(--shadow)',animationDelay:`${i*.04}s`}}>
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px'}}>
              <div style={{width:50,height:50,flexShrink:0,background:m.bg,borderRadius:11,
                padding:5,border:`1px solid ${m.color}22`}}>
                <ExAnim ak={ex.a} color={m.color}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:15,color:'var(--t1)',marginBottom:6}}>{ex.name}</div>
                <div style={{display:'flex',gap:7,flexWrap:'wrap',alignItems:'center'}}>
                  <span style={{fontSize:14,fontWeight:800,color:'var(--pink)'}}>{s.sets}×{s.reps}</span>
                  <Tag label={s.load} color="var(--t3)" bg="var(--bg)"/>
                  <Tag label={m.label} color={m.color} bg={m.bg}/>
                </div>
              </div>
            </div>
            <div style={{padding:'10px 16px 14px',background:'#FAFAFA',
              borderTop:'1px solid var(--bd)',display:'flex',gap:10,alignItems:'flex-start'}}>
              <span style={{fontSize:16,flexShrink:0}}>💡</span>
              <span style={{fontSize:13,color:'var(--t2)',lineHeight:1.6,fontWeight:500}}>{s.tip}</span>
            </div>
          </div>
        )
      })}
    </div>
    <PinkBtn onClick={()=>onCreateFromGoal(ag)} size="md">
      ＋ Criar treino com estas sugestões
    </PinkBtn>
  </>)
}

// ============================================================
// HISTORY PANEL
// ============================================================
function HistoryPanel({userId}) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if(!userId) return
    dbLoadHistory(userId).then(h=>{setHistory(h);setLoading(false)}).catch(()=>setLoading(false))
  },[userId])

  const fmt = iso => {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})
  }
  const fmtTime = iso => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
  }

  if (loading) return (
    <div style={{display:'flex',justifyContent:'center',padding:'60px 0'}}>
      <Spinner size={32}/>
    </div>
  )

  if (!history.length) return (
    <div style={{textAlign:'center',padding:'48px 20px',background:'var(--s1)',
      borderRadius:20,border:'2px dashed var(--bd)'}}>
      <div style={{fontSize:52,marginBottom:12}}>📊</div>
      <div style={{fontSize:18,fontWeight:800,color:'var(--t1)',marginBottom:8}}>Sem histórico ainda</div>
      <div style={{fontSize:14,color:'var(--t2)',lineHeight:1.6}}>
        Complete um treino para<br/>ver seu histórico aqui
      </div>
    </div>
  )

  return(
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {history.map((s,i)=>(
        <div key={s.id} className="fu" style={{background:'var(--s1)',border:'1.5px solid var(--bd)',
          borderRadius:16,padding:'16px 18px',boxShadow:'var(--shadow)',animationDelay:`${i*.04}s`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
            <div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:.5,color:'var(--t1)',marginBottom:2}}>
                {s.plan_name}
              </div>
              <div style={{fontSize:13,color:'var(--t3)',fontWeight:600}}>
                {fmt(s.started_at)} · {fmtTime(s.started_at)}
              </div>
            </div>
            {s.finished_at
              ? <span style={{padding:'3px 9px',borderRadius:99,background:'var(--ok-bg)',
                  color:'var(--ok)',fontWeight:700,fontSize:12,border:'1px solid var(--ok-bd)'}}>✓ Concluído</span>
              : <span style={{padding:'3px 9px',borderRadius:99,background:'#FEF9C3',
                  color:'#854D0E',fontWeight:700,fontSize:12}}>Em andamento</span>
            }
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[
              ['💪',`${s.exercises_done||0}/${s.exercises_total} exercícios`],
              s.duration_minutes&&['⏱',`${s.duration_minutes} min`],
              s.kcal_estimate&&['🔥',`~${s.kcal_estimate} kcal`],
            ].filter(Boolean).map(([ic,v])=>(
              <div key={v} style={{display:'flex',alignItems:'center',gap:5,
                padding:'4px 9px',background:'var(--bg)',borderRadius:7,border:'1px solid var(--bd)'}}>
                <span style={{fontSize:12}}>{ic}</span>
                <span style={{fontSize:12,fontWeight:600,color:'var(--t2)'}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// MAIN APP (authenticated)
// ============================================================
function MainApp({user}) {
  const [plans,    setPlans]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [tab,      setTab]      = useState('plans')
  const [workout,  setWorkout]  = useState(null)
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [prefill,  setPrefill]  = useState(null)
  const [mf,       setMf]       = useState(null)
  const [weight,   setWeight]   = useState(70)
  const [goal,     setGoal]     = useState('hipertrofia')
  const [showCfg,  setShowCfg]  = useState(false)

  // Load plans and profile on mount
  useEffect(()=>{
    Promise.all([
      dbLoadPlans(user.id),
      dbLoadProfile(user.id),
    ]).then(([pl, profile])=>{
      setPlans(pl)
      if (profile?.weight_kg) setWeight(profile.weight_kg)
      if (profile?.goal)      setGoal(profile.goal)
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[user.id])

  // Save profile setting changes
  const updateProfile = useCallback((updates) => {
    dbSaveProfile(user.id, updates).catch(console.error)
  },[user.id])

  const openCreate=()=>{setEditing(null);setPrefill(null);setModal(true)}
  const openEdit=p=>{setEditing(p);setPrefill(null);setModal(true)}
  const closeModal=()=>{setModal(false);setEditing(null);setPrefill(null)}

  const savePlan = async (plan) => {
    closeModal()
    const tempId = plan._dbId || `tmp_${Date.now()}`
    setSavingId(tempId)
    try {
      const saved = await dbSavePlan(plan, user.id)
      setPlans(prev=>{
        const exists = prev.find(p=>p._dbId===saved._dbId||p.id===saved.id)
        return exists ? prev.map(p=>p._dbId===saved._dbId||p.id===saved.id?saved:p) : [...prev,saved]
      })
    } catch(e) {
      console.error('Erro ao salvar treino:', e)
      alert('Erro ao salvar o treino. Verifique sua conexão.')
    } finally {
      setSavingId(null)
    }
  }

  const deletePlan = async (plan) => {
    if (!window.confirm(`Excluir "${plan.name}"?`)) return
    setPlans(prev=>prev.filter(p=>p.id!==plan.id))
    if (plan._dbId) await dbDeletePlan(plan._dbId).catch(console.error)
  }

  const createFromGoal = gk => {
    const g=GOALS[gk], s=SUGGESTIONS[gk]||[]
    setPrefill({name:`Treino — ${g.label}`,exercises:s})
    setEditing(null);setModal(true);setTab('plans')
  }

  const handleSignOut = () => supabase.auth.signOut()

  const flib = mf?EX.filter(e=>e.m===mf):EX
  const gObj = GOALS[goal]

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
      <GS/>
      <Spinner size={40}/>
      <div style={{fontSize:14,color:'var(--t3)',fontWeight:600}}>Carregando seus treinos…</div>
    </div>
  )

  return (
    <div style={{maxWidth:540,margin:'0 auto',minHeight:'100vh',background:'var(--bg)'}}>
      {/* Header */}
      <div style={{padding:'24px 22px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:2,lineHeight:1,
            background:'var(--grad)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            GYM TRACKER
          </div>
          <div style={{fontSize:13,color:'var(--t3)',marginTop:3,fontWeight:600}}>
            {user.email}
          </div>
        </div>
        <button onClick={()=>setShowCfg(s=>!s)} style={{
          width:46,height:46,borderRadius:14,
          background:showCfg?'var(--grad)':'var(--s1)',
          border:`1.5px solid ${showCfg?'transparent':'var(--bd)'}`,
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
          boxShadow:showCfg?'0 4px 14px rgba(232,33,93,.3)':'var(--shadow)',
          transition:'all .25s'}}>⚙️</button>
      </div>

      {/* Settings */}
      {showCfg&&(
        <div className="fu" style={{margin:'14px 22px 0',padding:'18px 20px',background:'var(--s1)',
          border:'1.5px solid var(--bd)',borderRadius:18,boxShadow:'var(--shadow-md)'}}>
          <div style={{fontSize:13,fontWeight:800,color:'var(--t2)',letterSpacing:.4,marginBottom:14}}>
            CONFIGURAÇÕES
          </div>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:14,fontWeight:700,color:'var(--t1)',marginBottom:10}}>⚖️ Seu peso</div>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              {[[-5,'−'],[5,'+']].map(([delta,ic],bi)=>(
                <button key={bi} onClick={()=>{
                  const nw=Math.max(30,Math.min(200,weight+delta))
                  setWeight(nw);updateProfile({weight_kg:nw})
                }} style={{width:40,height:40,borderRadius:10,background:'var(--bg)',
                  border:'1.5px solid var(--bd-dk)',color:'var(--t2)',fontSize:20,
                  display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--pink)';e.currentTarget.style.color='var(--pink)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd-dk)';e.currentTarget.style.color='var(--t2)'}}>
                  {ic}
                </button>
              )).reduce((a,e,i)=>i===0?[e,
                <span key="w" style={{fontFamily:"'Bebas Neue'",fontSize:36,color:'var(--t1)',minWidth:72,textAlign:'center'}}>
                  {weight}<span style={{fontSize:18,fontWeight:400}}>kg</span>
                </span>,a[0]]:[...a,e],[])}
            </div>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'var(--t1)',marginBottom:10}}>
              🎯 Objetivo
            </div>
            <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
              {Object.entries(GOALS).map(([k,v])=>(
                <button key={k} onClick={()=>{setGoal(k);updateProfile({goal:k})}} style={{
                  padding:'8px 14px',borderRadius:10,fontSize:13,fontWeight:700,
                  background:goal===k?v.color+'18':'var(--bg)',color:goal===k?v.color:'var(--t2)',
                  border:`1.5px solid ${goal===k?v.color+'55':'var(--bd)'}`,transition:'all .2s'}}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSignOut} style={{
            marginTop:18,width:'100%',padding:'11px',background:'#FEF2F2',
            border:'1.5px solid #FECACA',borderRadius:10,color:'#DC2626',
            fontWeight:700,fontSize:13,transition:'all .2s'}}
            onMouseEnter={e=>e.currentTarget.style.background='#FEE2E2'}
            onMouseLeave={e=>e.currentTarget.style.background='#FEF2F2'}>
            Sair da conta
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{margin:'14px 22px 0',background:'var(--s1)',borderRadius:14,padding:4,
        border:'1.5px solid var(--bd)',display:'flex',boxShadow:'var(--shadow)'}}>
        {[['plans','🗂 Treinos'],['suggestions','✨ Sugestões'],['library','📚 Exercícios'],['history','📊 Histórico']].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1,padding:'10px 4px',borderRadius:10,fontWeight:700,fontSize:11,
            background:tab===t?'var(--grad)':'transparent',
            color:tab===t?'#fff':'var(--t3)',
            transition:'all .22s',
            boxShadow:tab===t?'0 2px 8px rgba(232,33,93,.3)':'none'}}>
            {l}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{padding:'18px 22px 100px'}}>

        {/* PLANS */}
        {tab==='plans'&&(<>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,
            padding:'10px 14px',background:'var(--s1)',border:'1.5px solid var(--bd)',
            borderRadius:12,boxShadow:'var(--shadow)'}}>
            <span style={{fontSize:16}}>{gObj.icon}</span>
            <div style={{flex:1,fontSize:14,color:'var(--t2)'}}>
              Objetivo: <span style={{fontWeight:800,color:gObj.color}}>{gObj.label}</span>
            </div>
            <span style={{fontSize:13,color:'var(--t3)',fontWeight:600}}>{weight} kg</span>
          </div>
          <div style={{marginBottom:20}}>
            <PinkBtn onClick={openCreate} size="lg">
              <span style={{fontSize:22,fontWeight:300}}>＋</span> Criar novo treino
            </PinkBtn>
          </div>
          {plans.length===0&&(
            <div style={{textAlign:'center',padding:'44px 20px',background:'var(--s1)',
              borderRadius:20,border:'2px dashed var(--bd)'}}>
              <div style={{fontSize:52,marginBottom:12}}>🏋️</div>
              <div style={{fontSize:18,fontWeight:800,color:'var(--t1)',marginBottom:8}}>Nenhum treino ainda</div>
              <div style={{fontSize:14,color:'var(--t2)',lineHeight:1.6}}>
                Crie seu primeiro treino acima<br/>e ele ficará salvo na sua conta
              </div>
            </div>
          )}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {plans.map((plan,i)=>(
              <PlanCard key={plan._dbId||plan.id} plan={plan} idx={i} weight={weight} goal={goal}
                saving={savingId===plan._dbId}
                onPlay={()=>setWorkout(plan)}
                onEdit={()=>openEdit(plan)}
                onDelete={()=>deletePlan(plan)}/>
            ))}
          </div>
        </>)}

        {tab==='suggestions'&&<SuggestionsPanel onCreateFromGoal={createFromGoal}/>}

        {tab==='library'&&(<>
          <div style={{display:'flex',gap:7,marginBottom:14,overflowX:'auto',paddingBottom:4}}>
            {[['','Todos'],...Object.entries(MUSCLES).map(([k,v])=>[k,v.label])].map(([k,l])=>{
              const mu=k?MUSCLES[k]:null;const active=mf===(k||null)
              return<button key={k} onClick={()=>setMf(k||null)} style={{
                padding:'7px 14px',borderRadius:20,fontSize:13,fontWeight:700,flexShrink:0,
                background:active?(mu?mu.bg:'#F3F4F6'):'var(--s1)',
                color:active?(mu?mu.color:'var(--t1)'):'var(--t2)',
                border:`1.5px solid ${active?(mu?mu.color+'44':'var(--bd-dk)'):'var(--bd)'}`,
                boxShadow:active?'var(--shadow)':'none',transition:'all .18s'}}>
                {l}
              </button>
            })}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {flib.map((ex,i)=><ExCard key={ex.id} ex={ex} delay={i*.02}/>)}
          </div>
        </>)}

        {tab==='history'&&<HistoryPanel userId={user.id}/>}
      </div>

      {/* Modals */}
      {(modal||editing)&&<PlanModal editing={editing} prefill={prefill} onSave={savePlan} onClose={closeModal}/>}
      {workout&&<WorkoutPlayer plan={workout} user={user} goal={goal} weight={weight} onClose={()=>setWorkout(null)}/>}
    </div>
  )
}

// ============================================================
// ROOT — Auth gate
// ============================================================
export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(()=>{
    // Get current session
    supabase.auth.getSession().then(({data:{session}})=>setSession(session))

    // Listen for auth changes (magic link callback, sign out, etc.)
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,session)=>{
      setSession(session)
    })
    return ()=>subscription.unsubscribe()
  },[])

  // Loading
  if (session===undefined) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'var(--s1)',flexDirection:'column',gap:16}}>
      <GS/>
      <Spinner size={40}/>
    </div>
  )

  return session ? <MainApp user={session.user}/> : <AuthScreen/>
}
