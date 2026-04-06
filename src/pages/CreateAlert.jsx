import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Bell, MapPin, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'

const ALERT_TYPES = [
  { value:'theft',      label:'Theft',      icon:'🚨', color:'#ff5252', desc:'Stolen item or pickpocketing' },
  { value:'fire',       label:'Fire',        icon:'🔥', color:'#ff6b35', desc:'Fire or smoke detected' },
  { value:'medical',    label:'Medical',     icon:'🏥', color:'#00e676', desc:'Injury or health emergency' },
  { value:'suspicious', label:'Suspicious',  icon:'👁', color:'#ffd740', desc:'Unusual or concerning behavior' },
  { value:'vandalism',  label:'Vandalism',   icon:'🔨', color:'#ce93d8', desc:'Property damage or graffiti' },
  { value:'other',      label:'Other',       icon:'⚠️', color:'#8899b4', desc:'Any other safety concern' },
]

const LOCATIONS = [
  'Amphitheater A','Amphitheater B','Library','Cafeteria',
  'Lab Block','Classrooms A','Classrooms B','Main Entrance','Parking',
]

export default function CreateAlert() {
  const { call } = useApi()
  const [step, setStep] = useState(1) // 1=type, 2=location, 3=desc, 4=success
  const [type, setType] = useState('')
  const [location, setLocation] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const selectedType = ALERT_TYPES.find(t => t.value === type)

  const submit = async () => {
    setLoading(true); setError('')
    const res = await call('/alerts', { method:'POST', body:{ type, location, description:desc } })
    setLoading(false)
    if (res?.id) { setResult(res); setStep(4) }
    else setError(res?.error || 'Failed to submit alert')
  }

  if (step === 4) return (
    <div className="animate-in" style={{maxWidth:500,margin:'40px auto',textAlign:'center'}}>
      <div style={{width:80,height:80,background:'rgba(0,230,118,.1)',border:'2px solid var(--green)',
        borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
        <CheckCircle size={40} color="var(--green)"/>
      </div>
      <h2 style={{fontWeight:700,fontSize:22,marginBottom:8}}>Alert Submitted!</h2>
      <p style={{color:'var(--text2)',fontSize:14,marginBottom:24,lineHeight:1.6}}>
        Your <strong>{type}</strong> alert at <strong>{location}</strong> is now pending community validation.
        It becomes active once <strong style={{color:'var(--green)'}}>3 users confirm it</strong>.
        You earned <strong style={{color:'var(--accent)'}}>+10 points</strong>!
      </p>

      <div className="card" style={{marginBottom:24,textAlign:'left'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:48,height:48,borderRadius:12,background:`${selectedType?.color||'#8899b4'}18`,
            border:`1px solid ${selectedType?.color||'#8899b4'}40`,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>
            {selectedType?.icon||'⚠️'}
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700}}>{type?.toUpperCase()}</div>
            <div style={{fontSize:13,color:'var(--text2)'}}>📍 {location}</div>
            {desc && <div style={{fontSize:12,color:'var(--text2)',marginTop:2,fontStyle:'italic'}}>"{desc}"</div>}
          </div>
          <span className="badge badge-yellow">0/3 confirmed</span>
        </div>
      </div>

      <div style={{display:'flex',gap:10,justifyContent:'center'}}>
        <button className="btn btn-primary" onClick={() => { setType('');setLocation('');setDesc('');setStep(1);setResult(null) }}>
          Report Another
        </button>
        <a href="/community" className="btn btn-ghost" style={{textDecoration:'none'}}>
          Community Votes
        </a>
      </div>
    </div>
  )

  return (
    <div className="animate-in" style={{maxWidth: 850, margin: '0 auto'}}>
      <div className="page-header">
        <div className="page-title" style={{fontSize: 28}}>🚨 Report an Incident</div>
        <div className="page-sub" style={{fontSize: 16}}>Anonymous · Needs 3 confirmations to activate</div>
      </div>

      {/* Step indicator */}
      <div style={{display:'flex',gap:4,marginBottom:24,alignItems:'center'}}>
        {['Type','Location','Details'].map((label,i) => {
          const s = i+1
          const done = step > s
          const active = step === s
          return (
            <div key={i} style={{display:'flex',alignItems:'center',gap:4,flex:s<3?1:undefined}}>
              <div style={{display:'flex',alignItems:'center',gap:6,cursor:done?'pointer':'default'}}
                onClick={() => done && setStep(s)}>
                <div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:14,fontWeight:700,fontFamily:'Space Mono',
                  background:done?'var(--green)':active?'var(--accent)':'var(--bg2)',
                  color:done||active?'#000':'var(--text2)',transition:'all 0.3s'}}>
                  {done ? '✓' : s}
                </div>
                <span style={{fontSize:15,color:active?'var(--text)':'var(--text2)',fontWeight:active?600:400}}>{label}</span>
              </div>
              {s < 3 && <div style={{flex:1,height:1,background:'var(--border)',margin:'0 4px'}}/>}
            </div>
          )
        })}
      </div>

      <div className="card">
        {/* STEP 1: Type */}
        {step === 1 && (
          <div className="animate-in">
            <div style={{fontWeight:600,marginBottom:6,fontSize:18}}>What type of incident?</div>
            <div style={{fontSize:15,color:'var(--text2)',marginBottom:20}}>Select the category that best describes the situation</div>
            <div className="grid-2" style={{gap:16}}>
              {ALERT_TYPES.map(t => (
                <button key={t.value} onClick={() => setType(t.value)}
                  style={{padding:'20px 16px',borderRadius:12,cursor:'pointer',transition:'all 0.2s',fontFamily:'inherit',
                    border:`2px solid ${type===t.value?t.color:'var(--border)'}`,
                    background:type===t.value?`${t.color}12`:'var(--bg2)',
                    display:'flex',alignItems:'center',gap:16,textAlign:'left'}}>
                  <span style={{fontSize:34,flexShrink:0}}>{t.icon}</span>
                  <div>
                    <div style={{fontWeight:600,fontSize:16,color:type===t.value?t.color:'var(--text)'}}>{t.label}</div>
                    <div style={{fontSize:13,color:'var(--text2)',marginTop:3}}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn btn-primary" style={{marginTop:24,width:'100%',justifyContent:'center',padding:'16px',fontSize:16}}
              disabled={!type} onClick={() => setStep(2)}>
              Next: Choose Location <ChevronRight size={20}/>
            </button>
          </div>
        )}

        {/* STEP 2: Location */}
        {step === 2 && (
          <div className="animate-in">
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <div style={{width:48,height:48,borderRadius:12,background:`${selectedType?.color||'#8899b4'}18`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>
                {selectedType?.icon}
              </div>
              <div>
                <div style={{fontWeight:600,fontSize:18}}>Where did it happen?</div>
                <div style={{fontSize:14,color:'var(--text2)'}}>{selectedType?.label} incident</div>
              </div>
            </div>
            <div className="grid-2" style={{gap:12, marginBottom:24}}>
              {LOCATIONS.map(l => (
                <button key={l} onClick={() => setLocation(l)}
                  style={{padding:'16px 14px',borderRadius:12,cursor:'pointer',fontFamily:'inherit',
                    fontSize:15,transition:'all 0.2s',textAlign:'left',
                    border:`1.5px solid ${location===l?'var(--accent)':'var(--border)'}`,
                    background:location===l?'rgba(0,212,255,.08)':'var(--bg2)',
                    color:location===l?'var(--accent)':'var(--text2)',fontWeight:location===l?600:400}}>
                  <MapPin size={16} style={{marginRight:8,verticalAlign:'middle'}}/>{l}
                </button>
              ))}
            </div>
            <div style={{display:'flex',gap:12}}>
              <button className="btn btn-ghost" style={{padding:'16px',fontSize:16}} onClick={() => setStep(1)}><ChevronLeft size={20}/> Back</button>
              <button className="btn btn-primary" style={{flex:1,justifyContent:'center',padding:'16px',fontSize:16}}
                disabled={!location} onClick={() => setStep(3)}>
                Next: Add Details <ChevronRight size={20}/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Description & submit */}
        {step === 3 && (
          <div className="animate-in">
            <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:24,
              padding:'16px',background:'var(--bg2)',borderRadius:12}}>
              <span style={{fontSize:32}}>{selectedType?.icon}</span>
              <div>
                <div style={{fontWeight:700,fontSize:18}}>{selectedType?.label}</div>
                <div style={{fontSize:14,color:'var(--text2)'}}>📍 {location}</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{fontSize:16}}>Description <span style={{color:'var(--text2)'}}>(optional)</span></label>
              <textarea className="form-input" rows={4} style={{resize:'vertical',fontSize:16,padding:'16px'}}
                placeholder="Briefly describe what you saw..."
                value={desc} onChange={e => setDesc(e.target.value)}/>
              <div style={{fontSize:13,color:'var(--text2)',marginTop:6}}>
                More details help the community make better decisions
              </div>
            </div>

            <div style={{padding:'14px 18px',background:'rgba(0,212,255,.05)',border:'1px solid rgba(0,212,255,.2)',
              borderRadius:10,fontSize:14,color:'var(--accent)',marginBottom:24,display:'flex',gap:12,alignItems:'center'}}>
              <Bell size={18} style={{flexShrink:0}}/>
              Your report is completely anonymous. Community needs 3 confirmations to activate it.
            </div>

            {error && (
              <div style={{padding:'12px',background:'rgba(255,82,82,.1)',border:'1px solid rgba(255,82,82,.3)',
                borderRadius:10,color:'var(--red)',fontSize:15,marginBottom:16}}>{error}</div>
            )}

            <div style={{display:'flex',gap:12}}>
              <button className="btn btn-ghost" style={{padding:'16px',fontSize:16}} onClick={() => setStep(2)}><ChevronLeft size={20}/> Back</button>
              <button className="btn btn-danger" style={{flex:1,justifyContent:'center',padding:'16px',fontSize:17}}
                onClick={submit} disabled={loading}>
                {loading ? 'Submitting...' : `🚨 Submit ${selectedType?.label} Alert`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
