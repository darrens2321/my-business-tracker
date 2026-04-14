import { useState, useMemo, useEffect } from "react";

const MONTHS = ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CATEGORIES = ["Housing","Transport","Bills","Insurance","Lifestyle","Living","Meals","Savings","Tax","Kids","Business","Other"];
const CAT_ICONS = {Housing:"🏠",Transport:"🚗",Bills:"📱",Insurance:"🛡️",Lifestyle:"✨",Living:"🛒",Meals:"🍽️",Savings:"💰",Tax:"🏛️",Kids:"👧",Business:"💼",Other:"📦"};
const fmt = (n) => `$${Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const extractHST = (g) => g - g/1.13;

// Canadian tax estimator (Ontario 2024)
const calcIncomeTax = (annualProfit) => {
  if(annualProfit<=0)return 0;
  const personal=15705;
  const taxable=Math.max(0,annualProfit-personal);
  let fed=0;
  if(taxable<=55867)fed=taxable*0.205;
  else if(taxable<=111733)fed=55867*0.205+(taxable-55867)*0.26;
  else fed=55867*0.205+55866*0.26+(taxable-111733)*0.29;
  let ont=0;
  const otaxable=Math.max(0,annualProfit-11865);
  if(otaxable<=51446)ont=otaxable*0.0505;
  else if(otaxable<=102894)ont=51446*0.0505+(otaxable-51446)*0.0915;
  else ont=51446*0.0505+51448*0.0915+(otaxable-102894)*0.1116;
  return fed+ont;
};
const calcCPP = (annualProfit) => {
  const exempt=3500; const max=68500;
  const cpp=Math.min(Math.max(0,annualProfit-exempt),max-exempt)*0.119;
  return cpp;
};
const genId = () => Math.random().toString(36).slice(2,9);

const RECURRING = [
  {id:"r1", name:"Rent",                 budget:2400, category:"Housing",   cash:false},
  {id:"r2", name:"Car Payment",          budget:480,  category:"Transport", cash:false},
  {id:"r3", name:"Car Insurance",        budget:185,  category:"Transport", cash:false},
  {id:"r4", name:"Gas",                  budget:400,  category:"Transport", cash:false},
  {id:"r5", name:"Rogers/Phone/Internet",budget:464,  category:"Bills",     cash:false},
  {id:"r6", name:"Life Insurance",       budget:184,  category:"Insurance", cash:false},
  {id:"r7", name:"Other Insurance",      budget:50,   category:"Insurance", cash:false},
  {id:"r8", name:"Cleaning",             budget:400,  category:"Lifestyle", cash:false},
  {id:"r9", name:"Pickleball",           budget:120,  category:"Lifestyle", cash:false},
  {id:"r10",name:"Groceries",            budget:800,  category:"Living",    cash:false},
  {id:"r11",name:"Entertainment",        budget:400,  category:"Lifestyle", cash:false},
  {id:"r12",name:"TFSA Savings",         budget:200,  category:"Savings",   cash:false},
  {id:"r13",name:"CRA Tax Payment",       budget:500,  category:"Tax",       cash:false},
  {id:"r14",name:"Mia Allowance",          budget:50,   category:"Kids",      cash:false},
  {id:"r17",name:"Kids Therapy",           budget:200,  category:"Kids",      cash:false},
  {id:"r16",name:"Lunches/Meals (Work)",   budget:400,  category:"Meals",     cash:false},
  {id:"r15",name:"Jake Allowance",         budget:50,   category:"Kids",      cash:false},
];

const buildMonthExpenses = () => {
  const r={};
  MONTHS.forEach(m=>{r[m]=RECURRING.map(rec=>({...rec,id:genId(),recurringId:rec.id,actual:null,paid:false,note:"",spends:[]}));});
  return r;
};

const MAY = {Elaine:816.30,Evan:600,Regency:1011,Shane:420,Alisa:1000,Jordan:0,Megan:500,Ryan:500,Eva:390,Maura:280,Bob:271,Ari:650,Lori:406,Steven:900,"Steven New":90,Ben:672,Renee:361,Debour:680,Promenade:200,Major:600};
const CASH_CLIENTS = ["Alisa","Steven","Debour","Promenade"];

const INIT_CLIENTS = Object.keys(MAY).map(name=>({
  id:genId(),name,phone:"",totalSessions:0,packagePrice:0,sessionsUsed:0,sessions:[],active:true,cash:CASH_CLIENTS.includes(name)
}));

const buildRevenue = () => {
  const r={};
  MONTHS.forEach(m=>{
    const clients=INIT_CLIENTS.map(c=>({id:genId(),clientId:c.id,name:c.name,amount:m==="May"?(MAY[c.name]||0):0,cash:c.cash,note:""}));
    const ccb={id:genId(),name:"CCB — Canada Child Benefit",amount:833.49,cash:true,note:"Government benefit · tax-free",fixed:true};
    r[m]=[...clients,ccb];
  });
  return r;
};

export default function App() {
  const load = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : (typeof fallback === "function" ? fallback() : fallback); } catch(e) { return typeof fallback === "function" ? fallback() : fallback; }};
  const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {} };

  const [screen,setScreen]     = useState("home");
  const [finTab,setFinTab]     = useState("expenses");
  const [month,setMonth]       = useState("May");
  const [revenue,setRevenue]   = useState(()=>load("bt_revenue", buildRevenue));
  const [expenses,setExpenses] = useState(()=>load("bt_expenses", buildMonthExpenses));
  const [recurring,setRecurring] = useState(()=>load("bt_recurring", RECURRING));
  const [clients,setClients]   = useState(()=>load("bt_clients", INIT_CLIENTS));
  const [clientView,setClientView] = useState("list");
  const [selClient,setSelClient]   = useState(null);
  const [editActual,setEditActual] = useState(null);
  const [actualInput,setActualInput] = useState("");
  const [showAddExp,setShowAddExp]   = useState(false);
  const [editRecId,setEditRecId]     = useState(null);
  const [recForm,setRecForm]         = useState(null);
  const [expForm,setExpForm] = useState({name:"",budget:"",category:"Other",cash:false});
  const [newCli,setNewCli]   = useState({name:"",phone:"",totalSessions:"",packagePrice:"",cash:false});
  const [msgData,setMsgData] = useState(null);
  const [copied,setCopied]   = useState(false);
  const [startingBalance,setStartingBalance] = useState(()=>load("bt_startbal", 4000));
  const [editingBalance,setEditingBalance] = useState(false);
  const [budgetEdits,setBudgetEdits] = useState({});
  const [revEdits,setRevEdits] = useState({});
  const [balInput,setBalInput] = useState('4000');
  const [kidsTab,setKidsTab] = useState("mia");
  const [respContrib,setRespContrib] = useState(()=>load("bt_resp", {mia:{},jake:{}}));
  const [respInput,setRespInput] = useState("");
  const [editingResp,setEditingResp] = useState(null);
  const [tfsaExtra,setTfsaExtra] = useState(()=>load("bt_tfsaextra", {}));
  const [tfsaInput,setTfsaInput] = useState("");
  const [editingTfsa,setEditingTfsa] = useState(null);

  // Auto-save whenever data changes
  useEffect(()=>save("bt_revenue", revenue), [revenue]);
  useEffect(()=>save("bt_expenses", expenses), [expenses]);
  useEffect(()=>save("bt_recurring", recurring), [recurring]);
  useEffect(()=>save("bt_clients", clients), [clients]);
  useEffect(()=>save("bt_startbal", startingBalance), [startingBalance]);
  useEffect(()=>save("bt_resp", respContrib), [respContrib]);
  useEffect(()=>save("bt_tfsaextra", tfsaExtra), [tfsaExtra]);

  const mRevRows = useMemo(()=>revenue[month]||[],[revenue,month]);
  const mExpRows = useMemo(()=>expenses[month]||[],[expenses,month]);

  const stats = useMemo(()=>{
    const cardRows  = mRevRows.filter(r=>!r.cash);
    const cashRows  = mRevRows.filter(r=>r.cash);
    const totalCard = cardRows.reduce((s,r)=>s+Number(r.amount),0);
    const totalCash = cashRows.reduce((s,r)=>s+Number(r.amount),0);
    const totalRev  = totalCard+totalCash;
    const hstCollected = extractHST(totalCard);
    const paidExp   = mExpRows.filter(e=>e.paid);
    const totalPaid = paidExp.reduce((s,e)=>s+Number(e.actual??e.budget),0);
    const cashPaid  = paidExp.filter(e=>e.cash).reduce((s,e)=>s+Number(e.actual??e.budget),0);
    const hstPaid   = extractHST(totalPaid-cashPaid);
    const hstOwed   = hstCollected-hstPaid;
    const budget    = mExpRows.reduce((s,e)=>s+Number(e.budget),0);
    const unpaid    = mExpRows.filter(e=>!e.paid).reduce((s,e)=>s+Number(e.budget),0);
    const moneyLeft = totalRev - totalPaid - Math.max(0,hstOwed);
    const runningBalance = MONTHS.slice(0, MONTHS.indexOf(month)+1).reduce((bal,m) => {
      const mRev  = (revenue[m]||[]).reduce((s,r)=>s+Number(r.amount),0);
      const mExp  = (expenses[m]||[]).filter(e=>e.paid).reduce((s,e)=>s+Number(e.actual??e.budget),0);
      const mHST  = Math.max(0, extractHST((revenue[m]||[]).filter(r=>!r.cash).reduce((s,r)=>s+Number(r.amount),0)) - extractHST(mExp));
      return bal + mRev - mExp - mHST - 500;
    }, startingBalance);
    return {totalCard,totalCash,totalRev,hstCollected,totalPaid,cashPaid,hstPaid,hstOwed,budget,unpaid,paidCount:paidExp.length,moneyLeft,runningBalance};
  },[mRevRows,mExpRows]);

  const grouped = useMemo(()=>{
    const g={};
    mExpRows.forEach(e=>{const c=e.category||"Other";if(!g[c])g[c]=[];g[c].push(e);});
    return g;
  },[mExpRows]);

  // Revenue
  const updRevAmt=(id,val)=>setRevenue(p=>({...p,[month]:p[month].map(r=>r.id===id?{...r,amount:Number(val)}:r)}));
  const togCashRev=(id)=>setRevenue(p=>({...p,[month]:p[month].map(r=>r.id===id?{...r,cash:!r.cash}:r)}));

  // Expenses
  const markPaid=(id,amt)=>{setExpenses(p=>({...p,[month]:p[month].map(e=>e.id===id?{...e,paid:true,actual:amt!==""?Number(amt):e.budget}:e)}));setEditActual(null);setActualInput("");};
  const markUnpaid=(id)=>setExpenses(p=>({...p,[month]:p[month].map(e=>e.id===id?{...e,paid:false,actual:null}:e)}));
  const updBudget=(id,v)=>setExpenses(p=>({...p,[month]:p[month].map(e=>e.id===id?{...e,budget:Number(v)}:e)}));
  const togCashExp=(id)=>setExpenses(p=>({...p,[month]:p[month].map(e=>e.id===id?{...e,cash:!e.cash}:e)}));
  const delExp=(id)=>setExpenses(p=>({...p,[month]:p[month].filter(e=>e.id!==id)}));
  const logSpend=(id,amt)=>{
    if(!amt||Number(amt)<=0)return;
    setExpenses(p=>({...p,[month]:p[month].map(e=>{
      if(e.id!==id)return e;
      const spends=[...(e.spends||[]),{id:genId(),amount:Number(amt),date:new Date().toLocaleDateString("en-CA")}];
      const used=spends.reduce((s,x)=>s+x.amount,0);
      return{...e,spends,actual:used,paid:used>=e.budget};
    })}));
  };
  const removeSpend=(expId,spendId)=>{
    setExpenses(p=>({...p,[month]:p[month].map(e=>{
      if(e.id!==expId)return e;
      const spends=(e.spends||[]).filter(x=>x.id!==spendId);
      const used=spends.reduce((s,x)=>s+x.amount,0);
      return{...e,spends,actual:used||null,paid:used>=e.budget};
    })}));
  };
  const addExp=()=>{
    if(!expForm.name.trim()||!expForm.budget)return;
    setExpenses(p=>({...p,[month]:[...(p[month]||[]),{...expForm,id:genId(),budget:Number(expForm.budget),actual:null,paid:false}]}));
    setExpForm({name:"",budget:"",category:"Other",cash:false});setShowAddExp(false);
  };
  const saveRec=()=>{
    if(!recForm)return;
    setRecurring(p=>p.map(r=>r.id===editRecId?{...r,...recForm,budget:Number(recForm.budget)}:r));
    setExpenses(p=>{const u={...p};MONTHS.forEach(m=>{if(u[m])u[m]=u[m].map(e=>e.recurringId===editRecId&&!e.paid?{...e,name:recForm.name,budget:Number(recForm.budget),category:recForm.category}:e);});return u;});
    setEditRecId(null);setRecForm(null);
  };

  // Clients
  const addClient=()=>{
    if(!newCli.name.trim())return;
    const c={...newCli,id:genId(),totalSessions:Number(newCli.totalSessions)||0,packagePrice:Number(newCli.packagePrice)||0,sessionsUsed:0,sessions:[],active:true};
    setClients(p=>[...p,c]);
    setRevenue(p=>{const u={...p};MONTHS.forEach(m=>{u[m]=[...(u[m]||[]),{id:genId(),name:c.name,amount:0,cash:c.cash,note:""}];});return u;});
    setNewCli({name:"",phone:"",totalSessions:"",packagePrice:"",cash:false});setClientView("list");
  };
  const addSession=(cid)=>setClients(p=>p.map(c=>{if(c.id!==cid)return c;const u=c.sessionsUsed+1;return{...c,sessionsUsed:u,sessions:[...c.sessions,{id:genId(),date:new Date().toLocaleDateString("en-CA"),remaining:c.totalSessions-u}]};}));
  const removeSession=(cid)=>setClients(p=>p.map(c=>{if(c.id!==cid||c.sessionsUsed===0)return c;return{...c,sessionsUsed:c.sessionsUsed-1,sessions:c.sessions.slice(0,-1)};}));
  const buildMsg=(c)=>{const rem=c.totalSessions-c.sessionsUsed;if(rem<=0)return `Hi ${c.name.split(" ")[0]}! 🏋️ Session ${c.sessionsUsed} complete — you've finished your full package of ${c.totalSessions} sessions! Amazing work 💪 Ready to start a new package? Let me know!`;return `Hi ${c.name.split(" ")[0]}! 🏋️ Session ${c.sessionsUsed} of ${c.totalSessions} complete. You have ${rem} session${rem===1?"":"s"} remaining in your package. Great work today! 💪`;};

  const Btn=({onClick,bg,color="#fff",children,style={}})=><button onClick={onClick} style={{background:bg,color,border:"none",borderRadius:10,padding:12,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer",width:"100%",...style}}>{children}</button>;
  const TopBar=({title,back,right})=>(
    <div style={{background:"#111",color:"#fff",padding:"18px 16px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {back&&<button onClick={back} style={{background:"none",border:"none",color:"#c8a96e",fontSize:22,cursor:"pointer",padding:0,lineHeight:1}}>‹</button>}
        <div><div style={{fontSize:9,letterSpacing:4,color:"#555"}}>MY BUSINESS</div><div style={{fontSize:19,fontWeight:900}}>{title}</div></div>
      </div>
      {right||<div/>}
    </div>
  );
  const MonthBar=()=>(
    <div style={{display:"flex",overflowX:"auto",background:"#111"}}>
      {MONTHS.map(m=>{const rev=(revenue[m]||[]).reduce((s,r)=>s+Number(r.amount),0);const a=month===m;return(
        <button key={m} onClick={()=>setMonth(m)} style={{background:a?"#f7f7f5":"transparent",color:a?"#111":"#666",border:"none",borderTop:a?"3px solid #c8a96e":"3px solid transparent",padding:"9px 13px 7px",fontFamily:"inherit",fontSize:11,fontWeight:a?900:400,cursor:"pointer",whiteSpace:"nowrap"}}>
          {m}{rev>0&&<div style={{fontSize:8,color:a?"#888":"#555",marginTop:1}}>{fmt(rev).slice(0,7)}</div>}
        </button>);
      })}
    </div>
  );
  const FinBar=()=>(
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",background:"#fff",borderBottom:"2px solid #eee"}}>
      {[["expenses","💸","Budget"],["income","💰","Card"],["cash","💵","Cash"],["recurring","🔄","Fixed"],["summary","📊","Summary"]].map(([v,ic,lb])=>{
        const cols={expenses:"#e74c3c",income:"#2ecc71",cash:"#f39c12",recurring:"#3498db",summary:"#c8a96e"};
        return <button key={v} onClick={()=>setFinTab(v)} style={{padding:"9px 2px",background:finTab===v?cols[v]:"#fff",color:finTab===v?"#fff":"#999",border:"none",fontFamily:"inherit",fontSize:9,fontWeight:700,cursor:"pointer"}}><div style={{fontSize:13}}>{ic}</div>{lb}</button>;
      })}
    </div>
  );

  // ── HOME ──
  if(screen==="home") return(
    <div style={{minHeight:"100vh",background:"#f7f7f5",fontFamily:"'Georgia',serif"}}>
      <div style={{background:"#111",color:"#fff",padding:"32px 20px 24px"}}>
        <div style={{fontSize:10,letterSpacing:4,color:"#555",marginBottom:4}}>WELCOME BACK</div>
        <div style={{fontSize:26,fontWeight:900}}>My Business</div>
        <div style={{fontSize:12,color:"#555",marginTop:2}}>Finance · Clients · Sessions</div>
      </div>
      <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:12}}>
        {[
          {sc:"finance",icon:"📊",title:"Finance Tracker",sub:"Income · Expenses · HST · Budget",note:`${month}: ${fmt(stats.totalRev)} income`,color:"#c8a96e"},
          {sc:"clients",icon:"👥",title:"Client Sessions",sub:"Track packages · Log sessions · Send messages",note:`${clients.length} clients loaded`,color:"#3498db"},
          {sc:"kids",icon:"💰",title:"Savings",sub:"TFSA $8,015 · RESP $5,806 · Kids allowance",note:"Tap to track contributions",color:"#1a6b3a"},
        ].map(b=>(
          <button key={b.sc} onClick={()=>setScreen(b.sc)} style={{background:"#fff",border:"none",borderRadius:14,padding:20,textAlign:"left",cursor:"pointer",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",borderLeft:`5px solid ${b.color}`}}>
            <div style={{fontSize:26,marginBottom:6}}>{b.icon}</div>
            <div style={{fontFamily:"'Georgia',serif",fontSize:16,fontWeight:900}}>{b.title}</div>
            <div style={{fontSize:11,color:"#888",marginTop:3}}>{b.sub}</div>
            <div style={{marginTop:8,fontSize:12,color:b.color,fontWeight:700}}>{b.note} →</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── CLIENTS ──
  if(screen==="clients"){
    const sel=clients.find(c=>c.id===selClient);

    if(msgData) return(
      <div style={{minHeight:"100vh",background:"#f7f7f5",fontFamily:"'Georgia',serif"}}>
        <TopBar title="Send Message" back={()=>setMsgData(null)}/>
        <div style={{padding:16}}>
          <div style={{background:"#fff",borderRadius:12,padding:16,marginBottom:12}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#aaa",marginBottom:8}}>MESSAGE PREVIEW</div>
            <div style={{background:"#e8f5e9",borderRadius:10,padding:14,fontSize:14,lineHeight:1.7}}>{msgData.msg}</div>
            <div style={{marginTop:10,fontSize:11,color:"#aaa"}}>To: {msgData.client.name}{msgData.client.phone?` · ${msgData.client.phone}`:""}</div>
          </div>
          {msgData.client.phone
            ?<Btn onClick={()=>window.open(`sms:${msgData.client.phone.replace(/\D/g,"")}?body=${encodeURIComponent(msgData.msg)}`,"_blank")} bg="#2ecc71" style={{marginBottom:10}}>📱 Open in Messages App</Btn>
            :<div style={{background:"#fffbe6",border:"1px solid #f0d060",borderRadius:8,padding:12,marginBottom:10,fontSize:12,color:"#7a6010"}}>No phone number saved. Add one in client details.</div>
          }
          <Btn onClick={()=>{navigator.clipboard.writeText(msgData.msg);setCopied(true);setTimeout(()=>setCopied(false),2000);}} bg={copied?"#2ecc71":"#111"} style={{marginBottom:10}}>{copied?"✅ Copied!":"📋 Copy Message"}</Btn>
          <Btn onClick={()=>setMsgData(null)} bg="#f0f0f0" color="#888">Back</Btn>
        </div>
      </div>
    );

    if(clientView==="detail"&&sel){
      const rem=sel.totalSessions-sel.sessionsUsed;
      const pct=sel.totalSessions?(sel.sessionsUsed/sel.totalSessions)*100:0;
      const col=rem===0?"#e74c3c":rem<=2?"#f39c12":"#3498db";
      return(
        <div style={{minHeight:"100vh",background:"#f7f7f5",fontFamily:"'Georgia',serif"}}>
          <TopBar title={sel.name} back={()=>setClientView("list")} right={<div style={{fontSize:11,color:sel.cash?"#f0d060":"#555",fontWeight:700}}>{sel.cash?"💵 CASH":""}</div>}/>
          <div style={{padding:16,paddingBottom:80}}>
            <div style={{background:"#111",color:"#fff",borderRadius:12,padding:18,marginBottom:14}}>
              <div style={{fontSize:9,letterSpacing:3,color:"#555",marginBottom:6}}>PACKAGE STATUS</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:36,fontWeight:900,color:"#3498db"}}>{sel.sessionsUsed}<span style={{fontSize:16,color:"#555"}}>/{sel.totalSessions||"?"}</span></div><div style={{fontSize:11,color:"#888"}}>sessions done</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:28,fontWeight:900,color:col}}>{rem}</div><div style={{fontSize:11,color:"#888"}}>remaining</div></div>
              </div>
              <div style={{height:7,background:"#222",borderRadius:4,overflow:"hidden",marginTop:14}}><div style={{height:"100%",width:`${pct}%`,background:"#3498db",borderRadius:4,transition:"width 0.5s"}}/></div>
              {sel.packagePrice>0&&<div style={{marginTop:8,fontSize:11,color:"#555"}}>Package: {fmt(sel.packagePrice)} · Per session: {fmt(sel.packagePrice/(sel.totalSessions||1))}</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center"}}>
                  <button onClick={()=>removeSession(sel.id)} disabled={sel.sessionsUsed===0} style={{background:sel.sessionsUsed===0?"#eee":"#fff0f0",color:sel.sessionsUsed===0?"#ccc":"#e74c3c",border:`2px solid ${sel.sessionsUsed===0?"#eee":"#e74c3c"}`,borderRadius:12,padding:"14px 10px",fontFamily:"inherit",fontWeight:900,fontSize:22,cursor:sel.sessionsUsed===0?"not-allowed":"pointer"}}>−</button>
                  <div style={{textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:"#3498db"}}>{sel.sessionsUsed}<span style={{fontSize:14,color:"#aaa"}}>/{sel.totalSessions||"?"}</span></div><div style={{fontSize:9,color:"#aaa",marginTop:2,letterSpacing:1}}>SESSIONS</div></div>
                  <button onClick={()=>{if(sel.totalSessions>0&&sel.sessionsUsed>=sel.totalSessions){alert("Package complete!");return;}addSession(sel.id);}} style={{background:sel.totalSessions>0&&sel.sessionsUsed>=sel.totalSessions?"#eee":"#2ecc71",color:sel.totalSessions>0&&sel.sessionsUsed>=sel.totalSessions?"#aaa":"#fff",border:"none",borderRadius:12,padding:"14px 10px",fontFamily:"inherit",fontWeight:900,fontSize:22,cursor:"pointer"}}>+</button>
                </div>
              <Btn onClick={()=>{const c=clients.find(x=>x.id===sel.id)||sel;setMsgData({client:c,msg:buildMsg(c)});setCopied(false);}} bg="#2ecc71">💬 Send Message</Btn>
            </div>
            <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:9,letterSpacing:3,color:"#aaa",marginBottom:10}}>CLIENT INFO</div>
              {[{label:"Phone",key:"phone",type:"tel"},{label:"Total Sessions",key:"totalSessions",type:"number"},{label:"Package Price ($)",key:"packagePrice",type:"number"}].map(f=>(
                <div key={f.key} style={{marginBottom:10}}>
                  <label style={{fontSize:9,color:"#aaa",letterSpacing:1,display:"block",marginBottom:3}}>{f.label}</label>
                  <input defaultValue={sel[f.key]} type={f.type} onBlur={e=>setClients(p=>p.map(c=>c.id===sel.id?{...c,[f.key]:f.type==="number"?Number(e.target.value):e.target.value}:c))}
                    style={{width:"100%",background:"#f9f9f9",border:"1px solid #e0e0e0",borderRadius:6,padding:"8px 10px",fontFamily:"inherit",fontSize:13,boxSizing:"border-box",outline:"none"}}/>
                </div>
              ))}
              <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer"}}>
                <input type="checkbox" checked={sel.cash} onChange={e=>setClients(p=>p.map(c=>c.id===sel.id?{...c,cash:e.target.checked}:c))} style={{width:16,height:16}}/>💵 Pays in cash
              </label>
            </div>
            {sel.sessions.length>0&&(
              <div style={{background:"#fff",borderRadius:12,padding:14}}>
                <div style={{fontSize:9,letterSpacing:3,color:"#aaa",marginBottom:10}}>SESSION HISTORY</div>
                {[...sel.sessions].reverse().map((s,i)=>(
                  <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f5f5f5",fontSize:13}}>
                    <span>Session {sel.sessions.length-i}</span>
                    <span style={{color:"#aaa",fontSize:11}}>{s.date}</span>
                    <span style={{color:"#3498db",fontWeight:700}}>{s.remaining} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if(clientView==="add") return(
      <div style={{minHeight:"100vh",background:"#f7f7f5",fontFamily:"'Georgia',serif"}}>
        <TopBar title="New Client" back={()=>setClientView("list")}/>
        <div style={{padding:16}}>
          <div style={{background:"#fff",borderRadius:12,padding:16}}>
            {[{label:"Client Name *",key:"name",type:"text",ph:"Full name"},{label:"Phone Number",key:"phone",type:"tel",ph:"416-555-1234"},{label:"Total Sessions",key:"totalSessions",type:"number",ph:"e.g. 10"},{label:"Package Price ($)",key:"packagePrice",type:"number",ph:"e.g. 500"}].map(f=>(
              <div key={f.key} style={{marginBottom:12}}>
                <label style={{fontSize:10,color:"#aaa",letterSpacing:1,display:"block",marginBottom:4}}>{f.label}</label>
                <input value={newCli[f.key]} onChange={e=>setNewCli(p=>({...p,[f.key]:e.target.value}))} type={f.type} placeholder={f.ph}
                  style={{width:"100%",background:"#f9f9f9",border:"1px solid #e0e0e0",borderRadius:8,padding:"10px 12px",fontFamily:"inherit",fontSize:13,boxSizing:"border-box",outline:"none"}}/>
              </div>
            ))}
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,marginBottom:14,cursor:"pointer"}}>
              <input type="checkbox" checked={newCli.cash} onChange={e=>setNewCli(p=>({...p,cash:e.target.checked}))} style={{width:16,height:16}}/>💵 Pays in cash
            </label>
            <Btn onClick={addClient} bg="#3498db">ADD CLIENT</Btn>
          </div>
        </div>
      </div>
    );

    const CardList=({list,label,labelColor})=>list.length===0?null:(<>
      <div style={{fontSize:9,letterSpacing:3,color:labelColor,marginBottom:8,fontWeight:700,marginTop:12}}>{label}</div>
      {list.map(c=>{
        const rem=c.totalSessions-c.sessionsUsed;
        const pct=c.totalSessions?(c.sessionsUsed/c.totalSessions)*100:0;
        const col=rem===0?"#e74c3c":rem<=2?"#f39c12":"#3498db";
        return(
          <div key={c.id} onClick={()=>{setSelClient(c.id);setClientView("detail");}} style={{background:c.cash?"#fffbe6":"#fff",borderRadius:12,padding:"13px 15px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",cursor:"pointer",borderLeft:`4px solid ${col}`,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div><div style={{fontWeight:700,fontSize:14}}>{c.name}</div>{c.phone&&<div style={{fontSize:10,color:"#aaa",marginTop:1}}>{c.phone}</div>}</div>
              <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:col}}>{c.totalSessions>0?rem:"—"}</div><div style={{fontSize:8,color:"#aaa"}}>left</div></div>
            </div>
            {c.totalSessions>0&&<><div style={{height:4,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:col,borderRadius:3}}/></div>
            <div style={{fontSize:9,color:"#aaa",marginTop:4}}>{c.sessionsUsed}/{c.totalSessions} done{rem===0?" · 🎉 Complete!":rem===1?" · ⚠️ Last session!":""}</div></>}
          </div>
        );
      })}
    </>);

    return(
      <div style={{minHeight:"100vh",background:"#f7f7f5",fontFamily:"'Georgia',serif"}}>
        <TopBar title="Clients" back={()=>setScreen("home")}/>
        <div style={{padding:16,paddingBottom:80}}>
          <Btn onClick={()=>setClientView("add")} bg="#3498db" style={{marginBottom:4}}>+ Add New Client</Btn>
          <CardList list={clients.filter(c=>!c.cash)} label="💳 CARD CLIENTS" labelColor="#888"/>
          <CardList list={clients.filter(c=>c.cash)} label="💵 CASH CLIENTS" labelColor="#7a6010"/>
        </div>
      </div>
    );
  }

  // ── KIDS / SAVINGS ──
  if(screen==="kids") {
    const totalRESP = Object.values(respContrib["resp"]||{}).reduce((s,v)=>s+Number(v),0);
    const respBalance = 5806 + totalRESP;
    const tfsaMonths = MONTHS.filter(m=>m>="May");
    const tfsaBaseContrib = tfsaMonths.filter(m=>m<=month).length * 200;
    const tfsaExtraTotal = Object.values(tfsaExtra).reduce((s,v)=>s+Number(v),0);
    const tfsaContributed = tfsaBaseContrib + tfsaExtraTotal;
    const tfsaBalance = 8015 + tfsaContributed;
    const monthTfsaExtra = tfsaExtra[month] || 0;
    const monthRESP = (respContrib["resp"]||{})[month] || 0;

    return(
      <div style={{minHeight:"100vh",background:"#f7f7f5",fontFamily:"'Georgia',serif"}}>
        <TopBar title="Savings" back={()=>setScreen("home")}/>
        <div style={{padding:"16px 16px 80px"}}>

          {/* TFSA Card */}
          <div style={{background:"#1a6b3a",color:"#fff",borderRadius:14,padding:20,marginBottom:14}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#5dbb7a",marginBottom:4}}>💰 TFSA</div>
            <div style={{fontSize:38,fontWeight:900,color:"#2ecc71",lineHeight:1}}>{fmt(tfsaBalance)}</div>
            <div style={{fontSize:10,color:"#5dbb7a",marginTop:6}}>started at $8,015 · +$200/month from May 15</div>
            <div style={{height:1,background:"#155a2e",margin:"14px 0"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              <div style={{background:"#155a2e",borderRadius:10,padding:"10px 10px"}}>
                <div style={{fontSize:8,color:"#5dbb7a",letterSpacing:1}}>STARTING</div>
                <div style={{fontWeight:700,fontSize:14,marginTop:3}}>$8,015</div>
              </div>
              <div style={{background:"#155a2e",borderRadius:10,padding:"10px 10px"}}>
                <div style={{fontSize:8,color:"#5dbb7a",letterSpacing:1}}>AUTO $200/mo</div>
                <div style={{fontWeight:700,fontSize:14,marginTop:3}}>{fmt(tfsaBaseContrib)}</div>
              </div>
              <div style={{background:"#155a2e",borderRadius:10,padding:"10px 10px"}}>
                <div style={{fontSize:8,color:"#5dbb7a",letterSpacing:1}}>EXTRA ADDED</div>
                <div style={{fontWeight:700,fontSize:14,marginTop:3}}>{fmt(tfsaExtraTotal)}</div>
              </div>
            </div>

            {/* Extra contribution per month */}
            <div style={{background:"#155a2e",borderRadius:10,padding:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{fontSize:9,color:"#5dbb7a",letterSpacing:2}}>EXTRA THIS MONTH ({month})</div>
                  <div style={{fontSize:18,fontWeight:900,color:"#2ecc71",marginTop:3}}>{monthTfsaExtra>0?fmt(monthTfsaExtra):"—"}</div>
                </div>
                <button onClick={()=>{setEditingTfsa(month);setTfsaInput(String(monthTfsaExtra||""));}} style={{background:"#2ecc71",color:"#111",border:"none",borderRadius:8,padding:"7px 12px",fontFamily:"inherit",fontWeight:700,fontSize:11,cursor:"pointer"}}>+ Extra</button>
              </div>
              {editingTfsa===month&&(
                <div style={{display:"flex",alignItems:"center",gap:8,background:"#0d3320",borderRadius:8,padding:10}}>
                  <span style={{fontSize:11,color:"#5dbb7a"}}>Extra $:</span>
                  <input autoFocus value={tfsaInput} onChange={e=>setTfsaInput(e.target.value)} type="number" placeholder="0"
                    style={{width:80,border:"1px solid #2ecc71",borderRadius:6,background:"#0a2218",color:"#2ecc71",fontFamily:"inherit",fontSize:14,fontWeight:700,outline:"none",padding:"5px 8px"}}/>
                  <button onClick={()=>{setTfsaExtra(prev=>({...prev,[month]:Number(tfsaInput)}));setEditingTfsa(null);setTfsaInput("");}} style={{background:"#2ecc71",color:"#111",border:"none",borderRadius:6,padding:"6px 12px",fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer"}}>Save</button>
                  <button onClick={()=>setEditingTfsa(null)} style={{background:"none",border:"none",color:"#5dbb7a",fontFamily:"inherit",fontSize:11,cursor:"pointer"}}>Cancel</button>
                </div>
              )}
              {/* Monthly breakdown */}
              <div style={{marginTop:10}}>
                {MONTHS.filter(m=>(tfsaExtra[m]||0)>0).map(m=>(
                  <div key={m} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#5dbb7a",padding:"4px 0",borderTop:"1px solid #1a6b3a"}}>
                    <span>{m} extra</span>
                    <span style={{fontWeight:700,color:"#2ecc71"}}>{fmt(tfsaExtra[m])}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RESP Card */}
          <div style={{background:"#fff",borderRadius:14,padding:20,marginBottom:14,border:"2px solid #3498db"}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#aaa",marginBottom:4}}>📈 RESP — KIDS</div>
            <div style={{fontSize:38,fontWeight:900,color:"#3498db",lineHeight:1}}>{fmt(respBalance)}</div>
            <div style={{fontSize:10,color:"#aaa",marginTop:6}}>started at $5,806 · add whenever you decide</div>
            <div style={{height:1,background:"#eee",margin:"14px 0"}}/>

            {/* Month selector */}
            <div style={{fontSize:10,color:"#888",marginBottom:8}}>Add contribution for:</div>
            <div style={{display:"flex",overflowX:"auto",gap:4,marginBottom:14}}>
              {MONTHS.map(m=>{
                const r=(respContrib["resp"]||{})[m]||0;
                const a=month===m;
                return(
                  <button key={m} onClick={()=>setMonth(m)} style={{
                    background:a?"#3498db":"#f0f0f0",color:a?"#fff":"#888",
                    border:"none",borderRadius:8,padding:"7px 12px",
                    fontFamily:"inherit",fontSize:11,fontWeight:a?900:400,
                    cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,
                  }}>
                    {m}{r>0&&<div style={{fontSize:8,marginTop:1,color:a?"#cce5ff":"#3498db"}}>${r}</div>}
                  </button>
                );
              })}
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:"#888"}}>{month} contribution</div>
                <div style={{fontSize:24,fontWeight:900,color:"#3498db"}}>{monthRESP===0?"—":fmt(monthRESP)}</div>
              </div>
              <button onClick={()=>{setEditingResp(month);setRespInput(String(monthRESP||""));}} style={{
                background:"#3498db",color:"#fff",border:"none",borderRadius:8,
                padding:"8px 14px",fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer",
              }}>+ Add</button>
            </div>

            {editingResp===month&&(
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,background:"#e8f4fd",borderRadius:8,padding:10}}>
                <span style={{fontSize:11,color:"#3498db"}}>RESP $:</span>
                <input autoFocus value={respInput} onChange={e=>setRespInput(e.target.value)} type="number" placeholder="0"
                  style={{width:80,border:"1px solid #3498db",borderRadius:6,background:"#fff",fontFamily:"inherit",fontSize:14,fontWeight:700,color:"#3498db",outline:"none",padding:"5px 8px"}}/>
                <button onClick={()=>{
                  setRespContrib(prev=>({...prev,resp:{...(prev.resp||{}),[month]:Number(respInput)}}));
                  setEditingResp(null);setRespInput("");
                }} style={{background:"#3498db",color:"#fff",border:"none",borderRadius:6,padding:"6px 12px",fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer"}}>Save</button>
                <button onClick={()=>setEditingResp(null)} style={{background:"#f0f0f0",color:"#888",border:"none",borderRadius:6,padding:"6px 10px",fontFamily:"inherit",fontSize:12,cursor:"pointer"}}>Cancel</button>
              </div>
            )}

            {/* RESP History */}
            <div style={{background:"#f7fbff",borderRadius:10,padding:12}}>
              <div style={{fontSize:9,letterSpacing:2,color:"#aaa",marginBottom:8}}>CONTRIBUTION HISTORY</div>
              {MONTHS.map(m=>{
                const r=(respContrib["resp"]||{})[m]||0;
                return(
                  <div key={m} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f0f0f0",opacity:r===0?0.3:1}}>
                    <span style={{fontSize:12,fontWeight:700}}>{m}</span>
                    <span style={{fontSize:12,fontWeight:900,color:r>0?"#3498db":"#ccc"}}>{r>0?fmt(r):"—"}</span>
                  </div>
                );
              })}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:"2px solid #3498db"}}>
                <span style={{fontWeight:700,fontSize:13}}>Total added</span>
                <span style={{fontWeight:900,fontSize:18,color:"#3498db"}}>{fmt(totalRESP)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                <span style={{fontWeight:700,fontSize:13}}>Total balance</span>
                <span style={{fontWeight:900,fontSize:18,color:"#3498db"}}>{fmt(respBalance)}</span>
              </div>
            </div>
          </div>

          {/* Kids allowance summary */}
          <div style={{background:"#fff",borderRadius:12,padding:16}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#aaa",marginBottom:12}}>👧🧒 KIDS ALLOWANCE</div>
            {[{name:"Mia Singer",amount:50},{name:"Jake Singer",amount:50}].map(k=>(
              <div key={k.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}>
                <span style={{fontSize:13,fontWeight:700}}>{k.name}</span>
                <span style={{fontSize:15,fontWeight:900,color:"#9b59b6"}}>${k.amount}/mo</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:"2px solid #9b59b6"}}>
              <span style={{fontWeight:700,fontSize:13}}>Total allowance</span>
              <span style={{fontWeight:900,fontSize:16,color:"#9b59b6"}}>$100/mo</span>
            </div>
            <div style={{fontSize:10,color:"#aaa",marginTop:6}}>Tracked in monthly Budget tab</div>
          </div>
        </div>
      </div>
    );
  }

  // ── FINANCE ──
  return(
    <div style={{minHeight:"100vh",background:"#f7f7f5",fontFamily:"'Georgia',serif",color:"#1a1a1a"}}>
      <TopBar title="Finance" back={()=>setScreen("home")} right={<div style={{fontSize:11,color:"#c8a96e",fontWeight:700}}>🇨🇦 ÷1.13</div>}/>
      <MonthBar/><FinBar/>
      <div style={{padding:"14px 14px 100px"}}>

        {/* BUDGET */}
        {finTab==="expenses"&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            {[{l:"BUDGET",v:fmt(stats.budget),c:"#888"},{l:"PAID",v:fmt(stats.totalPaid),c:"#e74c3c"},{l:"REMAINING",v:fmt(stats.unpaid),c:"#f39c12"}].map(k=>(
              <div key={k.l} style={{background:"#fff",borderRadius:8,padding:"10px",borderTop:`3px solid ${k.c}`}}>
                <div style={{fontSize:8,color:"#aaa",letterSpacing:1}}>{k.l}</div>
                <div style={{fontSize:14,fontWeight:900,color:k.c,marginTop:2}}>{k.v}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:10,color:"#aaa",marginBottom:10}}>✅ {stats.paidCount}/{mExpRows.length} paid · Tap ✓ to mark paid</div>
          {Object.entries(grouped).map(([cat,items])=>(
            <div key={cat} style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"#888",marginBottom:8}}>{CAT_ICONS[cat]||"📦"} {cat.toUpperCase()}</div>
              {items.map(e=>{
                const spent=e.paid?(e.actual??e.budget):null;
                const diff=spent!==null?spent-e.budget:null;
                const isEd=editActual===e.id;
                return(
                  <div key={e.id} style={{background:e.paid?"#f0faf4":"#fff",border:`1px solid ${e.paid?"#a9dfbf":"#e8e8e8"}`,borderRadius:10,padding:"11px 12px",marginBottom:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          {(e.spends||[]).reduce((s,x)=>s+x.amount,0)>=e.budget
                            ?<span onClick={()=>markUnpaid(e.id)} style={{fontSize:18,cursor:"pointer"}}>✅</span>
                            :<span onClick={()=>{setEditActual(e.id);setActualInput("");}} style={{width:22,height:22,borderRadius:"50%",border:"2px solid #3498db",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,color:"#3498db"}}>+</span>}
                          <span style={{fontWeight:700,fontSize:13}}>{e.name}</span>
                          {e.cash&&<span style={{fontSize:9,background:"#f0d060",color:"#7a6010",borderRadius:4,padding:"1px 5px",fontWeight:700}}>CASH</span>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
                          <span style={{fontSize:10,color:"#aaa"}}>Budget:</span>
                          <input
  value={budgetEdits[e.id]!==undefined ? budgetEdits[e.id] : String(e.budget)}
  onChange={ev=>setBudgetEdits(p=>({...p,[e.id]:ev.target.value}))}
  onBlur={ev=>{updBudget(e.id,ev.target.value);setBudgetEdits(p=>{const u={...p};delete u[e.id];return u;});}}
  style={{width:70,border:"none",borderBottom:"1px dashed #3498db",background:"transparent",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#3498db",outline:"none",padding:"0 2px"}}
/>
                        </div>
                        {/* SPEND TRACKER */}
                        {(()=>{
                          const spends=e.spends||[];
                          const used=spends.reduce((s,x)=>s+x.amount,0);
                          const remaining=e.budget-used;
                          const pct=e.budget?Math.min(100,(used/e.budget)*100):0;
                          const over=used>e.budget;
                          const near=!over&&pct>=75;
                          const barColor=over?"#e74c3c":near?"#f39c12":"#2ecc71";
                          return(<>
                            {/* Progress bar */}
                            {(used>0||isEd)&&<div style={{marginTop:8}}>
                              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:3}}>
                                <span style={{color:"#aaa"}}>Used: <strong style={{color:barColor}}>{fmt(used)}</strong></span>
                                <span style={{color:over?"#e74c3c":"#aaa"}}>
                                  {over?`▲ ${fmt(Math.abs(remaining))} OVER`:`${fmt(remaining)} left`}
                                </span>
                              </div>
                              <div style={{height:6,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${pct}%`,background:barColor,borderRadius:3,transition:"width 0.4s"}}/>
                              </div>
                            </div>}
                            {/* Spend log */}
                            {spends.length>0&&<div style={{marginTop:8,background:"#f9f9f9",borderRadius:6,padding:"6px 8px"}}>
                              {spends.map(x=>(
                                <div key={x.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,marginBottom:3}}>
                                  <span style={{color:"#888"}}>{x.date}</span>
                                  <span style={{fontWeight:700,color:"#555"}}>−{fmt(x.amount)}</span>
                                  <button onClick={()=>removeSpend(e.id,x.id)} style={{background:"none",border:"none",color:"#ccc",fontSize:12,cursor:"pointer",padding:"0 2px"}}>✕</button>
                                </div>
                              ))}
                            </div>}
                            {/* Add spend input */}
                            {isEd&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
                              <span style={{fontSize:10,color:"#aaa"}}>Used $:</span>
                              <input autoFocus value={actualInput} onChange={ev=>setActualInput(ev.target.value)} type="number" placeholder="0"
                                style={{width:70,border:"1px solid #3498db",borderRadius:4,background:"#e8f4fd",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#1a5276",outline:"none",padding:"3px 6px"}}/>
                              <button onClick={()=>{logSpend(e.id,actualInput);setEditActual(null);setActualInput("");}} style={{background:"#3498db",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",fontFamily:"inherit",fontSize:11,fontWeight:700,cursor:"pointer"}}>Add</button>
                              <button onClick={()=>setEditActual(null)} style={{background:"#f0f0f0",color:"#888",border:"none",borderRadius:6,padding:"4px 8px",fontFamily:"inherit",fontSize:11,cursor:"pointer"}}>✕</button>
                            </div>}
                          </>);
                        })()}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        <button onClick={()=>togCashExp(e.id)} style={{background:e.cash?"#f0d060":"#f0f0f0",border:"none",borderRadius:6,padding:"3px 7px",fontSize:13,cursor:"pointer"}}>💵</button>
                        <button onClick={()=>delExp(e.id)} style={{background:"#fff0f0",border:"none",borderRadius:6,padding:"3px 7px",fontSize:11,cursor:"pointer",color:"#c84444"}}>🗑</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <Btn onClick={()=>setShowAddExp(s=>!s)} bg={showAddExp?"#999":"#e74c3c"}>{showAddExp?"✕ Cancel":"+ Add One-Off Expense"}</Btn>
          {showAddExp&&<div style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:10,padding:14,marginTop:10}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:9,color:"#aaa",display:"block",marginBottom:3}}>NAME</label><input value={expForm.name} onChange={e=>setExpForm(f=>({...f,name:e.target.value}))} style={{width:"100%",background:"#f9f9f9",border:"1px solid #e0e0e0",borderRadius:6,padding:"7px 9px",fontFamily:"inherit",fontSize:12,boxSizing:"border-box",outline:"none"}}/></div>
              <div><label style={{fontSize:9,color:"#aaa",display:"block",marginBottom:3}}>AMOUNT ($)</label><input value={expForm.budget} onChange={e=>setExpForm(f=>({...f,budget:e.target.value}))} type="number" style={{width:"100%",background:"#f9f9f9",border:"1px solid #e0e0e0",borderRadius:6,padding:"7px 9px",fontFamily:"inherit",fontSize:12,boxSizing:"border-box",outline:"none"}}/></div>
            </div>
            <select value={expForm.category} onChange={e=>setExpForm(f=>({...f,category:e.target.value}))} style={{width:"100%",background:"#f9f9f9",border:"1px solid #e0e0e0",borderRadius:6,padding:"7px 9px",fontFamily:"inherit",fontSize:12,outline:"none",marginBottom:8}}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,marginBottom:10,cursor:"pointer"}}><input type="checkbox" checked={expForm.cash} onChange={e=>setExpForm(f=>({...f,cash:e.target.checked}))}/>💵 Cash</label>
            <Btn onClick={addExp} bg="#e74c3c">ADD</Btn>
          </div>}
        </>}

        {/* CARD INCOME */}
        {finTab==="income"&&<>
          <div style={{background:"#fff",borderRadius:10,padding:"12px 14px",marginBottom:14,borderLeft:"4px solid #2ecc71"}}>
            <div style={{fontSize:9,color:"#aaa",letterSpacing:2}}>TOTAL CARD INCOME — {month}</div>
            <div style={{fontSize:24,fontWeight:900,color:"#1a7a3a"}}>{fmt(stats.totalCard)}</div>
            <div style={{fontSize:10,color:"#c8a96e",marginTop:2}}>HST collected: {fmt(stats.hstCollected)}</div>
          </div>
          <div style={{fontSize:10,color:"#aaa",marginBottom:10}}>✏️ Tap any amount to edit directly · Tap 💵 to move to cash</div>
          {mRevRows.filter(r=>!r.cash).map(r=>(
            <div key={r.id} style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:10,padding:"11px 13px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <div><div style={{fontWeight:700,fontSize:13}}>{r.name}</div><div style={{fontSize:10,color:"#c8a96e",marginTop:2}}>HST: {fmt(extractHST(r.amount))}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input
  value={revEdits[r.id]!==undefined ? revEdits[r.id] : String(r.amount)}
  onChange={ev=>setRevEdits(p=>({...p,[r.id]:ev.target.value}))}
  onBlur={ev=>{updRevAmt(r.id,ev.target.value);setRevEdits(p=>{const u={...p};delete u[r.id];return u;});}}
  type="number"
  style={{width:80,border:"2px solid #2ecc71",borderRadius:8,background:"#f0faf4",fontFamily:"inherit",fontSize:16,fontWeight:900,color:"#1a7a3a",outline:"none",padding:"6px 8px",textAlign:"right"}}
/>
                <button onClick={()=>togCashRev(r.id)} style={{background:"#f0f0f0",border:"none",borderRadius:6,padding:"4px 7px",fontSize:13,cursor:"pointer"}}>💵</button>
              </div>
            </div>
          ))}
        </>}

        {/* CASH INCOME */}
        {finTab==="cash"&&<>
          <div style={{background:"#fffbe6",border:"1px solid #f0d060",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
            <div style={{fontSize:9,color:"#7a6010",letterSpacing:2}}>TOTAL CASH INCOME — {month}</div>
            <div style={{fontSize:24,fontWeight:900,color:"#7a6010"}}>{fmt(stats.totalCash)}</div>
            <div style={{fontSize:10,color:"#aaa",marginTop:2}}>Cash is excluded from HST · Tap amount to edit</div>
          </div>
          {mRevRows.filter(r=>r.cash).length===0
            ?<div style={{textAlign:"center",color:"#ccc",padding:"40px 20px",fontSize:13}}>No cash clients this month.<br/><span style={{fontSize:11}}>Tap 💵 on any card client to move them here.</span></div>
            :mRevRows.filter(r=>r.cash).map(r=>(
              <div key={r.id} style={{background:"#fffbe6",border:"1px solid #f0d060",borderRadius:10,padding:"11px 13px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                <div><div style={{fontWeight:700,fontSize:13}}>{r.name}</div><div style={{fontSize:10,color:"#aaa",marginTop:2}}>no HST</div></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <input
  value={revEdits[r.id]!==undefined ? revEdits[r.id] : String(r.amount)}
  onChange={ev=>setRevEdits(p=>({...p,[r.id]:ev.target.value}))}
  onBlur={ev=>{updRevAmt(r.id,ev.target.value);setRevEdits(p=>{const u={...p};delete u[r.id];return u;});}}
  type="number"
  style={{width:80,border:"2px solid #f0d060",borderRadius:8,background:"#fff9e0",fontFamily:"inherit",fontSize:16,fontWeight:900,color:"#7a6010",outline:"none",padding:"6px 8px",textAlign:"right"}}
/>
                  <button onClick={()=>togCashRev(r.id)} title="Move to card" style={{background:"#f0d060",border:"none",borderRadius:6,padding:"4px 7px",fontSize:13,cursor:"pointer"}}>💵</button>
                </div>
              </div>
            ))
          }
        </>}

        {/* RECURRING */}
        {finTab==="recurring"&&<>
          <div style={{background:"#e8f4fd",border:"1px solid #aed6f1",borderRadius:8,padding:"10px 12px",marginBottom:14,fontSize:11,color:"#1a5276"}}>🔄 Edit any amount — updates all future unpaid months.</div>
          {recurring.map(r=>(
            <div key={r.id} style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
              {editRecId===r.id&&recForm?(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <div><label style={{fontSize:9,color:"#aaa",display:"block",marginBottom:3}}>NAME</label><input value={recForm.name} onChange={e=>setRecForm(f=>({...f,name:e.target.value}))} style={{width:"100%",background:"#f9f9f9",border:"1px solid #e0e0e0",borderRadius:6,padding:"7px 9px",fontFamily:"inherit",fontSize:12,boxSizing:"border-box",outline:"none"}}/></div>
                    <div><label style={{fontSize:9,color:"#aaa",display:"block",marginBottom:3}}>BUDGET ($)</label><input value={recForm.budget} onChange={e=>setRecForm(f=>({...f,budget:e.target.value}))} type="number" style={{width:"100%",background:"#f9f9f9",border:"1px solid #e0e0e0",borderRadius:6,padding:"7px 9px",fontFamily:"inherit",fontSize:12,boxSizing:"border-box",outline:"none"}}/></div>
                  </div>
                  <select value={recForm.category} onChange={e=>setRecForm(f=>({...f,category:e.target.value}))} style={{width:"100%",background:"#f9f9f9",border:"1px solid #e0e0e0",borderRadius:6,padding:"7px 9px",fontFamily:"inherit",fontSize:12,outline:"none",marginBottom:8}}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <div style={{display:"flex",gap:8}}>
                    <Btn onClick={saveRec} bg="#3498db">SAVE ALL MONTHS</Btn>
                    <button onClick={()=>{setEditRecId(null);setRecForm(null);}} style={{background:"#f0f0f0",color:"#888",border:"none",borderRadius:10,padding:"12px 14px",fontFamily:"inherit",fontSize:13,cursor:"pointer"}}>Cancel</button>
                  </div>
                </div>
              ):(
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontWeight:700,fontSize:13}}>{CAT_ICONS[r.category]||"📦"} {r.name}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{r.category} · {fmt(r.budget)}/mo</div></div>
                  <button onClick={()=>{setEditRecId(r.id);setRecForm({name:r.name,budget:String(r.budget),category:r.category});}} style={{background:"#f0f0f0",border:"none",borderRadius:8,padding:"6px 12px",fontFamily:"inherit",fontSize:11,cursor:"pointer"}}>✏️ Edit</button>
                </div>
              )}
            </div>
          ))}
          <div style={{background:"#fff",borderRadius:10,padding:"12px 14px",border:"1px solid #e0e0e0"}}>
            <div style={{fontSize:9,color:"#aaa",letterSpacing:2}}>MONTHLY TOTAL</div>
            <div style={{fontSize:22,fontWeight:900,color:"#e74c3c"}}>{fmt(recurring.reduce((s,r)=>s+r.budget,0))}</div>
          </div>
        </>}

        {/* SUMMARY */}
        {finTab==="summary"&&<>
          <div style={{fontSize:9,letterSpacing:3,color:"#aaa",marginBottom:12}}>MONTH-END — {month.toUpperCase()}</div>

          {/* BANK BALANCE */}
          <div style={{background:"#1a3a5c",color:"#fff",borderRadius:14,padding:20,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:9,letterSpacing:3,color:"#4a8ab5",marginBottom:4}}>🏦 ESTIMATED BANK BALANCE</div>
                <div style={{fontSize:38,fontWeight:900,color:stats.runningBalance>=0?"#5dade2":"#e74c3c",lineHeight:1}}>
                  {fmt(stats.runningBalance)}
                </div>
                <div style={{fontSize:10,color:"#4a8ab5",marginTop:6}}>starting ${fmt(startingBalance)} + income − expenses − tax</div>
              </div>
              <button onClick={()=>{setEditingBalance(true);setBalInput(String(startingBalance));}} style={{background:"#2471a3",border:"none",borderRadius:8,padding:"6px 10px",color:"#fff",fontFamily:"inherit",fontSize:10,cursor:"pointer",fontWeight:700}}>✏️ Edit</button>
            </div>
            {editingBalance&&(
              <div style={{marginTop:14,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,color:"#4a8ab5"}}>Starting balance:</span>
                <input autoFocus value={balInput} onChange={e=>setBalInput(e.target.value)} type="number"
                  style={{width:90,border:"1px solid #5dade2",borderRadius:6,background:"#0d2137",color:"#5dade2",fontFamily:"inherit",fontSize:14,fontWeight:900,outline:"none",padding:"5px 8px"}}/>
                <button onClick={()=>{setStartingBalance(Number(balInput));setEditingBalance(false);}} style={{background:"#5dade2",color:"#fff",border:"none",borderRadius:6,padding:"6px 12px",fontFamily:"inherit",fontSize:11,fontWeight:700,cursor:"pointer"}}>Save</button>
                <button onClick={()=>setEditingBalance(false)} style={{background:"none",border:"none",color:"#4a8ab5",fontFamily:"inherit",fontSize:11,cursor:"pointer"}}>Cancel</button>
              </div>
            )}
            <div style={{height:1,background:"#2471a3",margin:"14px 0"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {MONTHS.map(m=>{
                const mRev=(revenue[m]||[]).reduce((s,r)=>s+Number(r.amount),0);
                if(mRev===0&&m!=="May") return null;
                const mExp=(expenses[m]||[]).filter(e=>e.paid).reduce((s,e)=>s+Number(e.actual??e.budget),0);
                const mHST=Math.max(0,extractHST((revenue[m]||[]).filter(r=>!r.cash).reduce((s,r)=>s+Number(r.amount),0))-extractHST(mExp));
                const mNet=mRev-mExp-mHST-500;
                return(
                  <div key={m} style={{background:"#0d2137",borderRadius:8,padding:"8px 10px"}}>
                    <div style={{fontSize:9,color:"#4a8ab5",letterSpacing:1}}>{m}</div>
                    <div style={{fontSize:13,fontWeight:900,color:mNet>=0?"#5dade2":"#e74c3c",marginTop:2}}>{mNet>=0?"+":""}{fmt(mNet)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* THE BIG NUMBER */}
          <div style={{background:"#111",color:"#fff",borderRadius:14,padding:20,marginBottom:12}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#555",marginBottom:4}}>WHAT YOU SHOULD HAVE LEFT</div>
            <div style={{fontSize:44,fontWeight:900,color:stats.moneyLeft>=0?"#2ecc71":"#e74c3c",lineHeight:1}}>
              {stats.moneyLeft>=0?"+":""}{fmt(stats.moneyLeft)}
            </div>
            <div style={{fontSize:11,color:"#555",marginTop:6}}>all income − expenses − HST owed</div>
            <div style={{height:1,background:"#222",margin:"14px 0"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[{l:"CARD IN",v:fmt(stats.totalCard),c:"#2ecc71"},{l:"CASH IN",v:fmt(stats.totalCash),c:"#f0d060"},{l:"PAID OUT",v:fmt(stats.totalPaid),c:"#e74c3c"}].map(k=>(
                <div key={k.l} style={{background:"#1a1a1a",borderRadius:8,padding:"10px 10px"}}>
                  <div style={{fontSize:8,color:k.c,letterSpacing:1}}>{k.l}</div>
                  <div style={{fontWeight:700,fontSize:13,marginTop:3,color:"#fff"}}>{k.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* HST */}
          <div style={{background:"#fff",borderRadius:12,padding:16,marginBottom:12,border:"2px solid #c8a96e"}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#aaa",marginBottom:12}}>🇨🇦 HST SUMMARY</div>
            {[
              {l:"HST Collected (card clients)",sub:`on ${fmt(stats.totalCard)}`,v:stats.hstCollected,sign:"+",c:"#2ecc71"},
              {l:"HST Paid on expenses",sub:`on ${fmt(stats.totalPaid-stats.cashPaid)}`,v:stats.hstPaid,sign:"−",c:"#e74c3c"},
            ].map(row=>(
              <div key={row.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,paddingBottom:10,borderBottom:"1px solid #f0f0f0"}}>
                <div><div style={{fontSize:12}}>{row.l}</div><div style={{fontSize:9,color:"#bbb"}}>{row.sub}</div></div>
                <div style={{fontWeight:900,fontSize:16,color:row.c}}>{row.sign}{fmt(row.v)}</div>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700}}>HST Owed to CRA</div>
              <div style={{fontWeight:900,fontSize:24,color:stats.hstOwed>=0?"#c8542e":"#2ecc71"}}>{fmt(Math.abs(stats.hstOwed))}{stats.hstOwed<0&&<span style={{fontSize:10,marginLeft:4}}>refund</span>}</div>
            </div>
            <div style={{background:"#fffbe6",borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:9,color:"#7a6010",letterSpacing:2,marginBottom:4}}>💵 CASH INCOME (NO HST)</div>
              <div style={{fontSize:20,fontWeight:900,color:"#7a6010"}}>{fmt(stats.totalCash)}</div>
              <div style={{fontSize:10,color:"#aaa",marginTop:2}}>Debour · Promenade · Alisa · Steven</div>
            </div>
          </div>

          {/* INCOME TAX ESTIMATOR */}
          {(()=>{
            const monthProfit = Math.max(0, stats.totalRev - stats.totalPaid);
            const fixedTax = 500;
            const monthlyHST = Math.max(0, stats.hstOwed);
            const totalCRA = fixedTax + monthlyHST;
            const trulyYours = stats.moneyLeft - fixedTax;
            const ytdTax = MONTHS.slice(0, MONTHS.indexOf(month)+1).reduce((s,m)=>{
              const mRev=(revenue[m]||[]).reduce((ms,r)=>ms+Number(r.amount),0);
              const mExp=(expenses[m]||[]).filter(e=>e.paid).reduce((ms,e)=>ms+Number(e.actual??e.budget),0);
              return s+(mRev>0?500:0);
            },0);
            return(
              <div style={{background:"#fff",borderRadius:12,padding:16,marginBottom:12,border:"2px solid #3498db"}}>
                <div style={{fontSize:9,letterSpacing:3,color:"#aaa",marginBottom:4}}>🏛️ CRA TAX PAYMENT — {month.toUpperCase()}</div>
                <div style={{fontSize:10,color:"#aaa",marginBottom:12}}>Fixed monthly payment · reassess at 6 months</div>
                {[
                  {l:"Fixed Tax Payment",sub:"advised by CFO · logged as expense",v:fixedTax,c:"#e74c3c"},
                  {l:"HST Owed to CRA",sub:"collected minus paid",v:monthlyHST,c:"#c8a96e"},
                ].map(row=>(
                  <div key={row.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,paddingBottom:10,borderBottom:"1px solid #f0f0f0"}}>
                    <div><div style={{fontSize:12}}>{row.l}</div><div style={{fontSize:9,color:"#bbb"}}>{row.sub}</div></div>
                    <div style={{fontWeight:900,fontSize:15,color:row.c}}>{fmt(row.v)}</div>
                  </div>
                ))}
                <div style={{background:"#111",borderRadius:10,padding:"14px 16px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:9,color:"#555",letterSpacing:2}}>TOTAL TO CRA THIS MONTH</div>
                    <div style={{fontSize:9,color:"#555",marginTop:2}}>tax + HST</div>
                  </div>
                  <div style={{fontSize:28,fontWeight:900,color:"#f39c12"}}>{fmt(totalCRA)}</div>
                </div>
                <div style={{background:"#eafaf1",borderRadius:10,padding:"14px 16px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:9,color:"#1a7a3a",letterSpacing:2}}>TRULY YOURS AFTER TAX</div>
                    <div style={{fontSize:9,color:"#aaa",marginTop:2}}>left after expenses + tax</div>
                  </div>
                  <div style={{fontSize:24,fontWeight:900,color:trulyYours>=0?"#2ecc71":"#e74c3c"}}>{fmt(trulyYours)}</div>
                </div>
                <div style={{background:"#e8f4fd",borderRadius:10,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:9,color:"#1a5276",letterSpacing:2}}>PAID TO CRA SO FAR</div>
                    <div style={{fontSize:9,color:"#aaa",marginTop:2}}>May → {month} running total</div>
                  </div>
                  <div style={{fontSize:20,fontWeight:900,color:"#3498db"}}>{fmt(ytdTax)}</div>
                </div>
                <div style={{fontSize:9,color:"#aaa",marginTop:10,lineHeight:1.5}}>
                  🔁 Reassess at 6 months (October) with your accountant.
                </div>
              </div>
            );
          })()}

          {/* Budget bar */}}
          <div style={{background:"#fff",borderRadius:10,padding:14,marginBottom:12}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#aaa",marginBottom:10}}>BUDGET VS ACTUAL</div>
            {[{l:"Monthly Budget",v:fmt(stats.budget)},{l:"Paid so far",v:fmt(stats.totalPaid),c:"#e74c3c"},{l:"Still to pay",v:fmt(stats.unpaid),c:"#f39c12"}].map(r=>(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}><span>{r.l}</span><span style={{fontWeight:700,color:r.c||"#111"}}>{r.v}</span></div>
            ))}
            <div style={{height:8,background:"#f0f0f0",borderRadius:4,overflow:"hidden",marginTop:8}}>
              <div style={{height:"100%",width:`${stats.budget?Math.min(100,(stats.totalPaid/stats.budget)*100):0}%`,background:"#e74c3c",borderRadius:4,transition:"width 0.5s"}}/>
            </div>
            <div style={{fontSize:9,color:"#aaa",marginTop:4}}>{stats.budget?((stats.totalPaid/stats.budget)*100).toFixed(0):0}% used</div>
          </div>

          {/* All months */}
          <div style={{background:"#fff",borderRadius:10,padding:14}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#aaa",marginBottom:10}}>ALL MONTHS AT A GLANCE</div>
            {MONTHS.map(m=>{
              const mRev=(revenue[m]||[]).reduce((s,r)=>s+Number(r.amount),0);
              const mCash=(revenue[m]||[]).filter(r=>r.cash).reduce((s,r)=>s+Number(r.amount),0);
              const mCard=mRev-mCash;
              const mExpPaid=(expenses[m]||[]).filter(e=>e.paid).reduce((s,e)=>s+Number(e.actual??e.budget),0);
              const mHST=extractHST(mCard)-extractHST(mExpPaid);
              const mLeft=mRev-mExpPaid-Math.max(0,mHST);
              return(
                <div key={m} onClick={()=>{setMonth(m);setFinTab("expenses");}} style={{display:"grid",gridTemplateColumns:"34px 1fr 1fr 1fr",gap:4,padding:"9px 0",borderBottom:"1px solid #f5f5f5",cursor:"pointer",alignItems:"center",opacity:mRev===0&&mExpPaid===0&&m!=="May"?0.3:1}}>
                  <div style={{fontWeight:700,fontSize:11}}>{m}</div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:8,color:"#aaa"}}>Income</div><div style={{fontSize:11,fontWeight:700,color:"#2ecc71"}}>{fmt(mRev)}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:8,color:"#aaa"}}>Out</div><div style={{fontSize:11,fontWeight:700,color:"#e74c3c"}}>{fmt(mExpPaid)}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:8,color:"#aaa"}}>Left</div><div style={{fontSize:11,fontWeight:700,color:mLeft>=0?"#2ecc71":"#e74c3c"}}>{fmt(mLeft)}</div></div>
                </div>
              );
            })}
          </div>
        </>}
      </div>
    </div>
  );
}
