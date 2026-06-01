import { useState, useEffect } from "react";

const SUPABASE_URL = "https://hfmqdldtcmnsejfzkpfe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmbXFkbGR0Y21uc2VqZnprcGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDgwNTksImV4cCI6MjA5NTc4NDA1OX0.6YkuD1uGnNv8YoZwa-L87st-ODn0vNIBBkoKW6GxLiA";

const api = async (path, method, body) => {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    method: method || "GET",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const SOURCES = {
  ARABLE:   { label: "Arable",         color: "#4a7fa5", icon: "🌱" },
  CATTLE:   { label: "Cattle",          color: "#8a6a3a", icon: "🐄" },
  SHEEP:    { label: "Sheep",           color: "#7a9a6a", icon: "🐑" },
  PIGS:     { label: "Pigs",            color: "#c47a5a", icon: "🐷" },
  FARM:     { label: "Farm (General)",  color: "#6a7a5a", icon: "🚜" },
  HORSES:   { label: "Horses",          color: "#9e7bb5", icon: "🐴" },
  CHAPEL:   { label: "Chapel Farm",     color: "#5a8a7a", icon: "⛪" },
  COWCLOSE: { label: "Cow Close",       color: "#c8a96e", icon: "🏠" },
  PROPERTY: { label: "Property",        color: "#7a6a9a", icon: "🏡" },
};

const STAFF = ["Self", "Farm Team", "Operator 1", "Operator 2", "Contractor"];
const PRIORITY = ["High", "Medium", "Low"];
const STATUS_COLORS = { "Open": "#c8a96e", "In Progress": "#4a7fa5", "Complete": "#5a8a6a", "On Hold": "#888888" };

const ARABLE_MONTHS = [
  { month: "Jan", crops: ["Winter Wheat","Winter Barley","OSR"], tasks: ["Fungicide T0 OSR","Crop walking","Advisor meeting"] },
  { month: "Feb", crops: ["Winter Wheat","Winter Barley","OSR"], tasks: ["Fertiliser N1","Pre-em herbicides","Slug pellet check"] },
  { month: "Mar", crops: ["Winter Wheat","Winter Barley","OSR"], tasks: ["N2 application","T0 fungicide wheat","Advisor meeting"] },
  { month: "Apr", crops: ["Winter Wheat","OSR","Spring Barley"], tasks: ["T1 fungicide","Spring drilling","Growth regulator"] },
  { month: "May", crops: ["Winter Wheat","Winter Barley","Spring Barley"], tasks: ["T2 fungicide","Insecticide OSR","Advisor meeting"] },
  { month: "Jun", crops: ["All cereals","OSR"], tasks: ["T3 ear spray","OSR desiccation prep","Harvest planning"] },
  { month: "Jul", crops: ["OSR","Winter Barley"], tasks: ["OSR harvest","Winter barley harvest","Straw baling"] },
  { month: "Aug", crops: ["Winter Wheat","Spring Barley"], tasks: ["Wheat harvest","Spring barley harvest","Stubble work"] },
  { month: "Sep", crops: ["Cover crops","Autumn drilling"], tasks: ["Subsoiling","Ploughing","Advisor meeting"] },
  { month: "Oct", crops: ["Winter Wheat","Winter Barley","OSR"], tasks: ["Drilling programme","Pre-em herbicides","Soil sampling"] },
  { month: "Nov", crops: ["Winter Wheat","OSR"], tasks: ["Post-em herbicides","Slug control","Drainage work"] },
  { month: "Dec", crops: ["All winter crops"], tasks: ["Crop walking","Equipment maintenance","Advisor review"] },
];

const SEED_TASKS = [
  {title:"Scrap metal skip order",source:"FARM",priority:"Low",assignee:"Self",status:"Complete",due:"2026-05-13",notes:"not possible",ref:"",category:"General"},
  {title:"XS farms recycling fees discuss re land area",source:"FARM",priority:"Medium",assignee:"Self",status:"Complete",due:"2026-05-13",notes:"",ref:"",category:"General"},
  {title:"Create diesel usage sheets",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-14",notes:"",ref:"",category:"General"},
  {title:"Fencing: Fence to exclude grooby stock from external condenser units",source:"FARM",priority:"High",assignee:"Farm Team",status:"Complete",due:"2026-04-14",notes:"",ref:"",category:"Fencing"},
  {title:"Flat rolling: Confirm desired effect",source:"HORSES",priority:"High",assignee:"Farm Team",status:"Complete",due:"2026-04-17",notes:"Only rolled cow close as conditions too dry.",ref:"",category:"Flat rolling"},
  {title:"Tree Work: Chestnut tree burley triangle",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Tree Work"},
  {title:"Building Maintenance: Remove ply panelling from workshop walls",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Building Maintenance"},
  {title:"MOT booked in for 15.04.26 Eden Tyres",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"General"},
  {title:"Flat rolling: Silage fields",source:"CATTLE",priority:"High",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Flat rolling"},
  {title:"Tidy: Scrap metal removal from hillside yard",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Tidy"},
  {title:"Pigs: Prep pen for weaning and AI",source:"PIGS",priority:"High",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Livestock"},
  {title:"Tree Work: Ash at old row",source:"PROPERTY",priority:"Medium",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Tree Work"},
  {title:"Pigs: Book in next milling date",source:"PIGS",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Livestock"},
  {title:"Stock: Herbal Ley order placed",source:"ARABLE",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"ordered",ref:"",category:"Stock"},
  {title:"Stock: AB9 Winter bird food Game cover",source:"ARABLE",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"ordered",ref:"",category:"Stock"},
  {title:"Pigs: Pig Hub movement records via HVN",source:"PIGS",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Livestock"},
  {title:"Pigs: AI Sow call Deerpark Pigs",source:"PIGS",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Livestock"},
  {title:"Pigs: Wean sow AI Tuesday afternoon",source:"PIGS",priority:"High",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Livestock"},
  {title:"Stock: Drive farm with Austin game covers action plan",source:"ARABLE",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Stock"},
  {title:"Equipment: Combine yield monitoring discuss during service",source:"ARABLE",priority:"High",assignee:"Self",status:"Complete",due:"2026-06-24",notes:"",ref:"",category:"Equipment"},
  {title:"Stock: CIPM2",source:"ARABLE",priority:"High",assignee:"Self",status:"Complete",due:"2026-06-24",notes:"",ref:"",category:"Stock"},
  {title:"Stock: Red Diesel",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-27",notes:"",ref:"",category:"Stock"},
  {title:"Farm security cameras and alarm system",source:"FARM",priority:"Medium",assignee:"Self",status:"Complete",due:"2026-04-28",notes:"Co contacted for quotes.",ref:"",category:"General"},
  {title:"Book NFU Visit",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-28",notes:"",ref:"",category:"General"},
  {title:"Stock: Adblue",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-28",notes:"",ref:"",category:"Stock"},
  {title:"Stock: White Diesel not required",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-28",notes:"Not required",ref:"",category:"Stock"},
  {title:"Stock: Red diesel order",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-28",notes:"",ref:"",category:"Stock"},
  {title:"Somerby supplier form",source:"ARABLE",priority:"Medium",assignee:"Self",status:"Complete",due:"2026-04-29",notes:"",ref:"",category:"General"},
  {title:"Rutland catering account",source:"FARM",priority:"Medium",assignee:"Self",status:"Complete",due:"2026-04-29",notes:"",ref:"",category:"General"},
  {title:"Fencing: Gate at dog kennel second hand if possible",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Hedge below chapel brash to clear",source:"CHAPEL",priority:"Medium",assignee:"Farm Team",status:"Open",due:"2026-05-01",notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Repair all yards and feed faces for next season",source:"FARM",priority:"High",assignee:"Farm Team",status:"Open",due:"2026-10-01",notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Post struck by trailer gate no longer lines up currently chained",source:"FARM",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Building Maintenance: Empty and repair all gutters",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Building Maintenance"},
  {title:"Tidy: Trommel screen rubble and burn piles spread on fields",source:"FARM",priority:"Low",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Tidy"},
  {title:"Building Maintenance: Jet wash fibre cement panels apply coating replace damaged",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Building Maintenance"},
  {title:"Tidy: Crusher upcycle building rubble into hardcore for tracks",source:"FARM",priority:"Low",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Tidy"},
  {title:"Ditches: Systematically clear and reshape ditches around the farm",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Ditches"},
  {title:"Tidy: Separate useful materials from rubble at building laydown area",source:"FARM",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tidy"},
  {title:"Tracks: Hardcore resurface catching pen surface prepped needs completing",source:"FARM",priority:"High",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Earthworks: Reshape and destroy rat burrows and habitat",source:"ARABLE",priority:"High",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Earthworks"},
  {title:"Building Maintenance: Move to new workshop rat free machinery area",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Building Maintenance"},
  {title:"Tracks: Cow close back drive",source:"COWCLOSE",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Tracks: Cow close front drive",source:"COWCLOSE",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Tracks: Exton Lane",source:"PROPERTY",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Tracks: Walk in cooler prep room approach",source:"PROPERTY",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Tracks: Engine shed",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Tree Work: As per survey",source:"FARM",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tree Work"},
  {title:"Woodchip: Chip remaining timber for summer usage",source:"CHAPEL",priority:"High",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Woodchip"},
  {title:"Record keeping: Migrate paper records for last 4 years",source:"ARABLE",priority:"Low",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Record keeping"},
  {title:"Record keeping: Upload drainage drawings to map layers",source:"ARABLE",priority:"Low",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Record keeping"},
  {title:"Record keeping: Confirm all 2026 crop year dates and plans with Steve",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Record keeping"},
  {title:"Pigs: Return unwanted minerals to Harbro",source:"PIGS",priority:"High",assignee:"Self",status:"In Progress",due:null,notes:"Discussed with Harbro but still ongoing",ref:"",category:"Livestock"},
  {title:"Fencing: Remove fence village green",source:"PROPERTY",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Mucking out: Discuss new muck area access for turning create long windrow",source:"FARM",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Mucking Out"},
  {title:"Grassland: Call pig slurry contractor application 1st week of June",source:"PIGS",priority:"High",assignee:"Self",status:"In Progress",due:null,notes:"Called but leaving open until date confirmed",ref:"",category:"Grassland"},
  {title:"Equipment: Section control migrate manual to digital Chandlers consolidation",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Equipment"},
  {title:"Work up job spec for arable operator employee or contractor",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Training: Spray certificates PA2 PA4 PA6",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Training"},
  {title:"Training: BASIS",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Training"},
  {title:"Training: FACTS",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Training"},
  {title:"Training: Chainsaw",source:"FARM",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Training"},
  {title:"Nutrient Soil Health IPM plans for SFI",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Building Maintenance: Bunding legalities and risk mitigation",source:"FARM",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Building Maintenance"},
  {title:"Pigs: Follow up refund ad lib feeder paid for 1t collected smaller",source:"PIGS",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Livestock"},
  {title:"Fert Canary Grass 40kg/ha discuss with Austin",source:"PROPERTY",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Fencing: Barnsdale meadows cut bramble clear rubbish fence",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Gate posts discuss with David and Joss",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Stock: Calculate fert requirements",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"at meeting with BTD",ref:"",category:"Stock"},
  {title:"Mucking out: Final muck out of all sheds",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Mucking Out"},
  {title:"Building Maintenance: Clear rubble hillside barn",source:"PROPERTY",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Building Maintenance"},
  {title:"Footpath turner rail Kubota with topper through field",source:"FARM",priority:"High",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Equipment: Combine yield mapping",source:"ARABLE",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Equipment"},
  {title:"Tree Work: Remove timber from burley triangle",source:"PROPERTY",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tree Work"},
  {title:"Fencing: Cow close big field single strand electric",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Cow close small field corner fence",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Grooby small paddock",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Graveyard grooby boundary",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: The mound gate posts",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fill rabbit holes the mound",source:"FARM",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Move logs for horse jumps",source:"HORSES",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Earthworks: Move soil from overdyke",source:"FARM",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Earthworks"},
  {title:"Business plan feed",source:"FARM",priority:"Low",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Manhole covers for septic tank at office",source:"PROPERTY",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Prestressed concrete and freestanding panels for grain shed",source:"ARABLE",priority:"Medium",assignee:"Self",status:"In Progress",due:null,notes:"Order placed waiting for invoice",ref:"",category:"General"},
  {title:"Discuss trade in Joss ATV for new under warranty",source:"COWCLOSE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Fencing: Order hi-tensile wire posts and insultube Progressive Farming",source:"FARM",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fix tree guard in park field",source:"FARM",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Hay ring move from Park",source:"HORSES",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Tracks: Chapel to Langham lane",source:"CHAPEL",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Earthworks: Pond at chapel overflow and runoff",source:"CHAPEL",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Earthworks"},
];

function HoursChart(props) {
  var logs = props.logs;
  if (!logs || logs.length === 0) {
    return React.createElement("div", {style:{color:"#5a5e50",fontSize:11,padding:"12px 0"}}, "No hours logged this month yet.");
  }
  var totals = {};
  logs.forEach(function(l) { totals[l.source] = (totals[l.source] || 0) + parseFloat(l.hours); });
  var max = Math.max.apply(null, Object.values(totals).concat([1]));
  return React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:6}},
    Object.entries(totals).sort(function(a,b){return b[1]-a[1];}).map(function(entry) {
      var src = entry[0]; var hrs = entry[1];
      return React.createElement("div", {key:src, style:{display:"flex",alignItems:"center",gap:8}},
        React.createElement("span", {style:{fontSize:10,color:"#8a8e7a",width:90,flexShrink:0}}, (SOURCES[src] ? SOURCES[src].icon : "") + " " + (SOURCES[src] ? SOURCES[src].label : src)),
        React.createElement("div", {style:{flex:1,background:"#1a1c18",height:14,position:"relative"}},
          React.createElement("div", {style:{position:"absolute",left:0,top:0,height:"100%",width:((hrs/max)*100)+"%",background:(SOURCES[src] ? SOURCES[src].color : "#888") + "aa"}})
        ),
        React.createElement("span", {style:{fontSize:11,color:SOURCES[src]?SOURCES[src].color:"#888",width:36,textAlign:"right"}}, hrs+"h")
      );
    })
  );
}

function generatePDF(tasks, diaryEntries, timeLogs, monthLabel) {
  var completed = tasks.filter(function(t){return t.status==="Complete";});
  var open = tasks.filter(function(t){return t.status!=="Complete";});
  var highOpen = open.filter(function(t){return t.priority==="High";});
  var totals = {};
  timeLogs.forEach(function(l){totals[l.source]=(totals[l.source]||0)+parseFloat(l.hours);});
  var totalHours = Object.values(totals).reduce(function(a,b){return a+b;},0);
  var hoursRows = Object.entries(totals).sort(function(a,b){return b[1]-a[1];}).map(function(e){
    return "<tr><td>"+(SOURCES[e[0]]?SOURCES[e[0]].icon+" "+SOURCES[e[0]].label:e[0])+"</td><td style='text-align:right'>"+e[1]+"h</td><td style='text-align:right'>"+(totalHours>0?Math.round(e[1]/totalHours*100):0)+"%</td></tr>";
  }).join("");
  var completedRows = completed.slice(0,30).map(function(t){
    return "<tr><td>"+t.title+"</td><td>"+(SOURCES[t.source]?SOURCES[t.source].label:t.source)+"</td><td>"+(t.due||"")+"</td></tr>";
  }).join("");
  var highRows = highOpen.slice(0,15).map(function(t){
    return "<tr><td>"+t.title+"</td><td>"+(SOURCES[t.source]?SOURCES[t.source].label:t.source)+"</td><td>"+(t.assignee||"")+"</td></tr>";
  }).join("");
  var html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>body{font-family:Georgia,serif;color:#1a1c18;margin:40px;line-height:1.5}h1{font-size:26px;color:#1a1c18;border-bottom:3px solid #c8a96e;padding-bottom:8px}h2{font-size:13px;color:#c8a96e;letter-spacing:2px;text-transform:uppercase;margin:24px 0 10px;border-bottom:1px solid #e0d8c8;padding-bottom:4px}.meta{font-size:12px;color:#6a6e5e;margin-bottom:24px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#f5f0e8;text-align:left;padding:6px 10px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#6a6e5e}td{padding:6px 10px;border-bottom:1px solid #e8e0d0}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}.stat{background:#f5f0e8;padding:14px;text-align:center}.stat-val{font-size:28px;color:#c8a96e;font-weight:bold}.stat-lbl{font-size:10px;color:#6a6e5e;text-transform:uppercase;letter-spacing:1px;margin-top:4px}</style></head><body>";
  html += "<h1>Estate Farm Monthly Report</h1><div class='meta'>Period: "+monthLabel+" &nbsp;&middot;&nbsp; Generated: "+new Date().toLocaleDateString("en-GB")+"</div>";
  html += "<div class='stats'><div class='stat'><div class='stat-val'>"+completed.length+"</div><div class='stat-lbl'>Completed</div></div><div class='stat'><div class='stat-val'>"+open.length+"</div><div class='stat-lbl'>Open</div></div><div class='stat'><div class='stat-val'>"+highOpen.length+"</div><div class='stat-lbl'>High Priority</div></div><div class='stat'><div class='stat-val'>"+totalHours+"h</div><div class='stat-lbl'>Hours Logged</div></div></div>";
  html += "<h2>Time Allocation by Area</h2><table><thead><tr><th>Area</th><th style='text-align:right'>Hours</th><th style='text-align:right'>%</th></tr></thead><tbody>"+(hoursRows||"<tr><td colspan='3'>No hours logged</td></tr>")+"</tbody></table>";
  html += "<h2>Tasks Completed</h2><table><thead><tr><th>Task</th><th>Area</th><th>Date</th></tr></thead><tbody>"+(completedRows||"<tr><td colspan='3'>None</td></tr>")+"</tbody></table>";
  html += "<h2>High Priority Open Items</h2><table><thead><tr><th>Task</th><th>Area</th><th>Assigned</th></tr></thead><tbody>"+(highRows||"<tr><td colspan='3'>None</td></tr>")+"</tbody></table>";
  html += "</body></html>";
  var blob = new Blob([html], {type:"text/html"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = "farm-report-"+monthLabel.replace(" ","-").toLowerCase()+".html"; a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  var today = new Date().toISOString().slice(0,10);
  var currentMonth = new Date().getMonth();
  var nowLabel = new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  var monthStart = new Date(); monthStart.setDate(1);
  var monthStartStr = monthStart.toISOString().slice(0,10);

  var ts = useState([]); var tasks = ts[0]; var setTasks = ts[1];
  var ds = useState([]); var diaryEntries = ds[0]; var setDiaryEntries = ds[1];
  var ls = useState([]); var timeLogs = ls[0]; var setTimeLogs = ls[1];
  var ld = useState(true); var loading = ld[0]; var setLoading = ld[1];
  var sd = useState(false); var seeding = sd[0]; var setSeeding = sd[1];
  var er = useState(null); var error = er[0]; var setError = er[1];
  var vw = useState("dashboard"); var view = vw[0]; var setView = vw[1];
  var fs = useState("ALL"); var filterSource = fs[0]; var setFilterSource = fs[1];
  var fst = useState("ALL"); var filterStatus = fst[0]; var setFilterStatus = fst[1];
  var fa = useState("ALL"); var filterAssignee = fa[0]; var setFilterAssignee = fa[1];
  var sat = useState(false); var showAddTask = sat[0]; var setShowAddTask = sat[1];
  var sel2 = useState(null); var selectedTask = sel2[0]; var setSelectedTask = sel2[1];
  var sc = useState(false); var showComplete = sc[0]; var setShowComplete = sc[1];
  var sv = useState(false); var saving = sv[0]; var setSaving = sv[1];
  var nt = useState({title:"",source:"FARM",priority:"Medium",assignee:"Self",status:"Open",due:"",notes:"",ref:"",category:"General"});
  var newTask = nt[0]; var setNewTask = nt[1];
  var dd = useState(today); var diaryDate = dd[0]; var setDiaryDate = dd[1];
  var dn = useState(""); var diaryNotes = dn[0]; var setDiaryNotes = dn[1];
  var dh = useState({}); var diaryHours = dh[0]; var setDiaryHours = dh[1];
  var sdy = useState(false); var savingDiary = sdy[0]; var setSavingDiary = sdy[1];
  var dsc = useState(false); var diarySuccess = dsc[0]; var setDiarySuccess = dsc[1];

  var loadAll = function() {
    setLoading(true);
    Promise.all([
      api("tasks?order=id.asc"),
      api("diary_entries?order=entry_date.desc&limit=60"),
      api("time_logs?entry_date=gte."+monthStartStr+"&order=entry_date.desc"),
    ]).then(function(results) {
      setTasks(results[0]||[]);
      setDiaryEntries(results[1]||[]);
      setTimeLogs(results[2]||[]);
      setLoading(false);
    }).catch(function(e) {
      setError("Load failed: "+e.message);
      setLoading(false);
    });
  };

  useEffect(function(){ loadAll(); }, []);

  var seedDatabase = function() {
    setSeeding(true);
    var payload = SEED_TASKS.map(function(t){return Object.assign({},t,{due:t.due||null,date_added:today});});
    api("tasks","POST",payload).then(function(){
      return loadAll();
    }).catch(function(e){
      setError("Seed failed: "+e.message);
      setSeeding(false);
    });
  };

  var addTask = function() {
    if (!newTask.title) return;
    setSaving(true);
    var payload = Object.assign({},newTask,{due:newTask.due||null,date_added:today});
    api("tasks","POST",payload).then(function(result){
      setTasks(function(prev){return prev.concat([result[0]]);});
      setNewTask({title:"",source:"FARM",priority:"Medium",assignee:"Self",status:"Open",due:"",notes:"",ref:"",category:"General"});
      setShowAddTask(false);
      setSaving(false);
    }).catch(function(e){setError("Save failed: "+e.message);setSaving(false);});
  };

  var updateTaskStatus = function(id, status) {
    api("tasks?id=eq."+id,"PATCH",{status:status}).then(function(){
      setTasks(function(prev){return prev.map(function(t){return t.id===id?Object.assign({},t,{status:status}):t;});});
      setSelectedTask(function(prev){return prev&&prev.id===id?Object.assign({},prev,{status:status}):prev;});
    }).catch(function(){setError("Update failed.");});
  };

  var deleteTask = function(id) {
    api("tasks?id=eq."+id,"DELETE").then(function(){
      setTasks(function(prev){return prev.filter(function(t){return t.id!==id;});});
      setSelectedTask(null);
    }).catch(function(){setError("Delete failed.");});
  };

  var saveDiary = function() {
    if (!diaryNotes && Object.keys(diaryHours).length===0) return;
    setSavingDiary(true);
    api("diary_entries","POST",{entry_date:diaryDate,notes:diaryNotes}).then(function(entry){
      var entryId = entry[0].id;
      var logs = Object.entries(diaryHours).filter(function(e){return parseFloat(e[1])>0;}).map(function(e){return {entry_date:diaryDate,source:e[0],hours:parseFloat(e[1]),diary_entry_id:entryId};});
      var next = logs.length>0 ? api("time_logs","POST",logs) : Promise.resolve();
      return next;
    }).then(function(){
      setDiaryNotes(""); setDiaryHours({}); setDiarySuccess(true);
      setTimeout(function(){setDiarySuccess(false);},3000);
      setSavingDiary(false);
      loadAll();
    }).catch(function(e){setError("Diary save failed: "+e.message);setSavingDiary(false);});
  };

  var filteredTasks = tasks.filter(function(t){
    if (!showComplete && t.status==="Complete") return false;
    if (filterSource!=="ALL" && t.source!==filterSource) return false;
    if (filterStatus!=="ALL" && t.status!==filterStatus) return false;
    if (filterAssignee!=="ALL" && t.assignee!==filterAssignee) return false;
    return true;
  });

  var openCount = tasks.filter(function(t){return t.status==="Open";}).length;
  var inProgressCount = tasks.filter(function(t){return t.status==="In Progress";}).length;
  var highPriority = tasks.filter(function(t){return t.priority==="High"&&t.status!=="Complete";}).length;
  var completeCount = tasks.filter(function(t){return t.status==="Complete";}).length;
  var totalHoursMonth = timeLogs.reduce(function(a,l){return a+parseFloat(l.hours);},0);
  var thisMonth = ARABLE_MONTHS[currentMonth];

  var S = {background:"#1a1c18",border:"1px solid #3a3e30",color:"#b0a890",padding:"7px 12px",fontSize:12,fontFamily:"inherit",cursor:"pointer"};
  var NAV = [["dashboard","Overview"],["tasks","Tasks"],["diary","Diary"],["arable","Arable"],["report","Report"],["email","Email"]];

  var e = React.createElement;

  return e("div", {style:{minHeight:"100vh",background:"#1a1c18",fontFamily:"'DM Mono','Courier New',monospace",color:"#e8e0d0"}},
    e("link",{href:"https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700&display=swap",rel:"stylesheet"}),

    // Hero
    e("div",{style:{height:160,position:"relative",overflow:"hidden",background:"#0e1008"}},
      e("img",{src:"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=70",alt:"",style:{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 60%",filter:"brightness(0.4)",display:"block"}}),
      e("div",{style:{position:"absolute",inset:0,background:"linear-gradient(to bottom, transparent 20%, #1a1c18 100%)"}}),
      e("div",{style:{position:"absolute",bottom:20,left:24}},
        e("div",{style:{fontFamily:"'Playfair Display',serif",fontSize:26,color:"#e8e0d0",letterSpacing:2}}, "ESTATE MANAGER"),
        e("div",{style:{fontSize:10,color:"#c8a96e",letterSpacing:4,textTransform:"uppercase",marginTop:4}},
          new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})
        )
      )
    ),

    // Nav
    e("div",{style:{borderBottom:"1px solid #2e3028",background:"#1a1c18",display:"flex",padding:"0 20px",position:"sticky",top:0,zIndex:100,overflowX:"auto"}},
      NAV.map(function(item){
        return e("button",{key:item[0],onClick:function(){setView(item[0]);},style:{background:view===item[0]?"#2e3028":"transparent",color:view===item[0]?"#c8a96e":"#6a6e5e",border:"none",padding:"10px 14px",cursor:"pointer",fontSize:11,letterSpacing:1,textTransform:"uppercase",borderBottom:view===item[0]?"2px solid #c8a96e":"2px solid transparent",whiteSpace:"nowrap",flexShrink:0}}, item[1]);
      })
    ),

    e("div",{style:{padding:"16px 20px",maxWidth:1300,margin:"0 auto"}},

      // Error
      error && e("div",{style:{background:"#3a1a1a",border:"1px solid #c0503a",color:"#c0503a",padding:"10px 16px",marginBottom:14,fontSize:12,display:"flex",justifyContent:"space-between",alignItems:"center"}},
        error,
        e("button",{onClick:function(){setError(null);},style:{background:"transparent",border:"none",color:"#c0503a",cursor:"pointer",fontSize:16}}, "×")
      ),

      // Loading
      loading && e("div",{style:{textAlign:"center",padding:60,color:"#5a5e50",fontSize:13}}, "Loading…"),

      // Seed
      !loading && tasks.length===0 && e("div",{style:{textAlign:"center",padding:60}},
        e("div",{style:{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#c8a96e",marginBottom:12}}, "Database connected"),
        e("div",{style:{color:"#6a6e5e",fontSize:13,marginBottom:24}}, "Load your existing 91 tasks to get started."),
        e("button",{onClick:seedDatabase,disabled:seeding,style:{background:"#c8a96e",color:"#1a1c18",border:"none",padding:"12px 28px",fontSize:13,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:1}}, seeding?"Loading…":"Load My Tasks")
      ),

      // DASHBOARD
      !loading && tasks.length>0 && view==="dashboard" && e("div",null,
        e("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}},
          [["Open Jobs",openCount,"#c8a96e"],["In Progress",inProgressCount,"#4a7fa5"],["High Priority",highPriority,"#c0503a"],["Completed",completeCount,"#5a8a6a"]].map(function(item){
            return e("div",{key:item[0],style:{background:"#22241e",border:"1px solid #2e3028",borderTop:"3px solid "+item[2],padding:"14px 16px"}},
              e("div",{style:{fontSize:32,fontFamily:"'Playfair Display',serif",color:item[2],lineHeight:1}}, item[1]),
              e("div",{style:{fontSize:10,color:"#6a6e5e",letterSpacing:2,marginTop:4,textTransform:"uppercase"}}, item[0])
            );
          })
        ),
        e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}},
          // High priority
          e("div",{style:{background:"#22241e",border:"1px solid #2e3028",padding:16}},
            e("div",{style:{fontSize:10,letterSpacing:3,color:"#c0503a",marginBottom:12,textTransform:"uppercase"}}, "⚠ High Priority"),
            tasks.filter(function(t){return t.priority==="High"&&t.status!=="Complete";}).slice(0,7).map(function(t){
              return e("div",{key:t.id,onClick:function(){setSelectedTask(t);setView("tasks");},style:{borderLeft:"3px solid "+(SOURCES[t.source]?SOURCES[t.source].color:"#888"),padding:"7px 10px",marginBottom:5,background:"#1a1c18",cursor:"pointer"}},
                e("div",{style:{fontSize:12,color:"#e8e0d0",marginBottom:2}}, t.title),
                e("div",{style:{display:"flex",gap:10,fontSize:10,color:"#5a5e50"}},
                  e("span",null, (SOURCES[t.source]?SOURCES[t.source].icon:"")+" "+(SOURCES[t.source]?SOURCES[t.source].label:t.source)),
                  e("span",null, "→ "+(t.assignee||"—")),
                  t.due && e("span",null, "📅 "+t.due)
                )
              );
            })
          ),
          // By area
          e("div",{style:{background:"#22241e",border:"1px solid #2e3028",padding:16}},
            e("div",{style:{fontSize:10,letterSpacing:3,color:"#c8a96e",marginBottom:12,textTransform:"uppercase"}}, "Jobs by Area"),
            Object.entries(SOURCES).map(function(entry){
              var key = entry[0]; var src = entry[1];
              var open = tasks.filter(function(t){return t.source===key&&t.status!=="Complete";}).length;
              var total = tasks.filter(function(t){return t.source===key;}).length;
              var high = tasks.filter(function(t){return t.source===key&&t.priority==="High"&&t.status!=="Complete";}).length;
              return e("div",{key:key,onClick:function(){setFilterSource(key);setView("tasks");setShowComplete(false);},style:{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #2e3028",cursor:"pointer"}},
                e("span",{style:{width:8,height:8,borderRadius:"50%",background:src.color,flexShrink:0,display:"inline-block"}}),
                e("span",{style:{flex:1,fontSize:11,color:"#b0a890"}}, src.icon+" "+src.label),
                high>0 && e("span",{style:{fontSize:9,color:"#c0503a"}}, "⚠"+high),
                e("span",{style:{fontSize:10,color:"#5a5e50"}}, total),
                e("span",{style:{background:open>0?src.color+"33":"transparent",color:open>0?src.color:"#3a3e30",padding:"2px 8px",fontSize:11,border:"1px solid "+(open>0?src.color+"55":"#2e3028"),minWidth:50,textAlign:"center"}}, open+" open")
              );
            })
          ),
          // Arable this month
          e("div",{style:{background:"#22241e",border:"1px solid #2e3028",padding:16}},
            e("div",{style:{fontSize:10,letterSpacing:3,color:"#4a7fa5",marginBottom:4,textTransform:"uppercase"}}, "🌱 Arable — "+thisMonth.month),
            e("div",{style:{fontSize:10,color:"#5a5e50",marginBottom:10}}, thisMonth.crops.join(" · ")),
            thisMonth.tasks.map(function(task,i){
              return e("div",{key:i,style:{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px solid #2a2c24",fontSize:12}},
                e("span",{style:{color:"#4a7fa5"}}, "▸"),
                e("span",{style:{color:"#c8d0b8"}}, task)
              );
            })
          ),
          // Hours
          e("div",{style:{background:"#22241e",border:"1px solid #2e3028",padding:16}},
            e("div",{style:{fontSize:10,letterSpacing:3,color:"#9e7bb5",marginBottom:12,textTransform:"uppercase"}}, "⏱ Hours This Month"),
            e(HoursChart,{logs:timeLogs}),
            e("div",{style:{marginTop:10,paddingTop:8,borderTop:"1px solid #2e3028"}},
              e("button",{onClick:function(){setView("diary");},style:{background:"transparent",color:"#9e7bb5",border:"1px solid #9e7bb533",padding:"5px 12px",fontSize:10,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:1}}, "+ Log Today")
            )
          )
        )
      ),

      // TASKS
      !loading && tasks.length>0 && view==="tasks" && e("div",{style:{display:"grid",gridTemplateColumns:selectedTask?"1fr 340px":"1fr",gap:14}},
        e("div",null,
          e("div",{style:{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}},
            e("button",{onClick:function(){setShowAddTask(!showAddTask);},style:{background:"#c8a96e",color:"#1a1c18",border:"none",padding:"8px 16px",fontSize:11,letterSpacing:1,cursor:"pointer",textTransform:"uppercase",fontFamily:"inherit"}}, "+ New Task"),
            e("select",{value:filterSource,onChange:function(ev){setFilterSource(ev.target.value);},style:S},
              e("option",{value:"ALL"},"All Areas"),
              Object.entries(SOURCES).map(function(en){return e("option",{key:en[0],value:en[0]},en[1].icon+" "+en[1].label);})
            ),
            e("select",{value:filterStatus,onChange:function(ev){setFilterStatus(ev.target.value);},style:S},
              e("option",{value:"ALL"},"All Statuses"),
              ["Open","In Progress","On Hold","Complete"].map(function(s){return e("option",{key:s},s);})
            ),
            e("select",{value:filterAssignee,onChange:function(ev){setFilterAssignee(ev.target.value);},style:S},
              e("option",{value:"ALL"},"All Assignees"),
              STAFF.map(function(s){return e("option",{key:s},s);})
            ),
            e("button",{onClick:function(){setShowComplete(!showComplete);},style:{background:showComplete?"#5a8a6a22":"transparent",color:showComplete?"#5a8a6a":"#6a6e5e",border:"1px solid "+(showComplete?"#5a8a6a44":"#3a3e30"),padding:"7px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}, showComplete?"✓ Completed":"Show Completed"),
            e("button",{onClick:loadAll,style:Object.assign({},S,{color:"#6a6e5e"})}, "↻"),
            e("span",{style:{fontSize:11,color:"#5a5e50"}}, filteredTasks.length+" tasks")
          ),

          showAddTask && e("div",{style:{background:"#22241e",border:"1px solid #c8a96e44",padding:16,marginBottom:12}},
            e("div",{style:{fontSize:10,letterSpacing:2,color:"#c8a96e",marginBottom:12,textTransform:"uppercase"}}, "New Task"),
            e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}},
              e("input",{placeholder:"Task title *",value:newTask.title,onChange:function(ev){setNewTask(Object.assign({},newTask,{title:ev.target.value}));},style:Object.assign({},S,{gridColumn:"1/-1",color:"#e8e0d0",padding:"8px 10px",fontSize:13})}),
              e("select",{value:newTask.source,onChange:function(ev){setNewTask(Object.assign({},newTask,{source:ev.target.value}));},style:S},
                Object.entries(SOURCES).map(function(en){return e("option",{key:en[0],value:en[0]},en[1].icon+" "+en[1].label);})
              ),
              e("select",{value:newTask.priority,onChange:function(ev){setNewTask(Object.assign({},newTask,{priority:ev.target.value}));},style:S},
                PRIORITY.map(function(p){return e("option",{key:p},p);})
              ),
              e("select",{value:newTask.assignee,onChange:function(ev){setNewTask(Object.assign({},newTask,{assignee:ev.target.value}));},style:S},
                STAFF.map(function(s){return e("option",{key:s},s);})
              ),
              e("select",{value:newTask.status,onChange:function(ev){setNewTask(Object.assign({},newTask,{status:ev.target.value}));},style:S},
                ["Open","In Progress","On Hold"].map(function(s){return e("option",{key:s},s);})
              ),
              e("input",{type:"date",value:newTask.due,onChange:function(ev){setNewTask(Object.assign({},newTask,{due:ev.target.value}));},style:S}),
              e("input",{placeholder:"Email ref (optional)",value:newTask.ref,onChange:function(ev){setNewTask(Object.assign({},newTask,{ref:ev.target.value}));},style:S}),
              e("textarea",{placeholder:"Notes",value:newTask.notes,onChange:function(ev){setNewTask(Object.assign({},newTask,{notes:ev.target.value}));},style:Object.assign({},S,{gridColumn:"1/-1",minHeight:55,resize:"vertical",fontSize:12})})
            ),
            e("div",{style:{display:"flex",gap:8,marginTop:10}},
              e("button",{onClick:addTask,disabled:saving,style:{background:"#c8a96e",color:"#1a1c18",border:"none",padding:"7px 18px",fontSize:11,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:1}}, saving?"Saving…":"Add Task"),
              e("button",{onClick:function(){setShowAddTask(false);},style:{background:"transparent",color:"#6a6e5e",border:"1px solid #3a3e30",padding:"7px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}, "Cancel")
            )
          ),

          e("div",{style:{display:"flex",flexDirection:"column",gap:5}},
            filteredTasks.length===0 && e("div",{style:{color:"#5a5e50",padding:20,textAlign:"center"}}, "No tasks match."),
            filteredTasks.map(function(t){
              var isSelected = selectedTask&&selectedTask.id===t.id;
              return e("div",{key:t.id,onClick:function(){setSelectedTask(isSelected?null:t);},
                style:{background:isSelected?"#252720":"#22241e",border:"1px solid "+(isSelected?"#c8a96e55":"#2e3028"),borderLeft:"4px solid "+(SOURCES[t.source]?SOURCES[t.source].color:"#888"),padding:"10px 14px",cursor:"pointer",display:"grid",gridTemplateColumns:"1fr auto",gap:8}},
                e("div",null,
                  e("div",{style:{fontSize:12,color:t.status==="Complete"?"#5a5e50":"#e8e0d0",marginBottom:3,textDecoration:t.status==="Complete"?"line-through":"none"}}, t.title),
                  e("div",{style:{display:"flex",gap:10,fontSize:10,color:"#5a5e50",flexWrap:"wrap"}},
                    e("span",null, (SOURCES[t.source]?SOURCES[t.source].icon:"")+" "+(SOURCES[t.source]?SOURCES[t.source].label:t.source)),
                    t.assignee && e("span",null, "→ "+t.assignee),
                    t.category&&t.category!=="General" && e("span",null, "🏷 "+t.category),
                    t.due && e("span",null, "📅 "+t.due),
                    t.ref && e("span",null, "📧 "+t.ref)
                  )
                ),
                e("div",{style:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}},
                  e("span",{style:{fontSize:9,padding:"2px 7px",letterSpacing:1,background:(STATUS_COLORS[t.status]||"#888")+"22",color:STATUS_COLORS[t.status]||"#888",border:"1px solid "+(STATUS_COLORS[t.status]||"#888")+"44",textTransform:"uppercase"}}, t.status),
                  e("span",{style:{fontSize:9,padding:"2px 7px",color:t.priority==="High"?"#c0503a":t.priority==="Medium"?"#c8a96e":"#5a8a6a",textTransform:"uppercase",letterSpacing:1}}, t.priority)
                )
              );
            })
          )
        ),

        selectedTask && e("div",{style:{background:"#22241e",border:"1px solid #2e3028",padding:18,alignSelf:"start",position:"sticky",top:50}},
          e("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}},
            e("div",{style:{fontSize:10,letterSpacing:2,color:SOURCES[selectedTask.source]?SOURCES[selectedTask.source].color:"#888",textTransform:"uppercase"}},
              (SOURCES[selectedTask.source]?SOURCES[selectedTask.source].icon:"")+" "+(SOURCES[selectedTask.source]?SOURCES[selectedTask.source].label:selectedTask.source)
            ),
            e("button",{onClick:function(){setSelectedTask(null);},style:{background:"transparent",border:"none",color:"#5a5e50",cursor:"pointer",fontSize:16}}, "×")
          ),
          e("div",{style:{fontSize:14,color:"#e8e0d0",marginBottom:12,lineHeight:1.5,fontFamily:"'Playfair Display',serif"}}, selectedTask.title),
          selectedTask.notes && e("div",{style:{background:"#1a1c18",padding:10,marginBottom:12,fontSize:11,color:"#8a8e7a",lineHeight:1.6,borderLeft:"2px solid #3a3e30"}}, selectedTask.notes),
          selectedTask.ref && e("div",{style:{fontSize:10,color:"#4a7fa5",marginBottom:10}}, "📧 "+selectedTask.ref),
          e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12,fontSize:10}},
            [["ASSIGNEE",selectedTask.assignee||"—"],["DUE",selectedTask.due||"—"],["PRIORITY",selectedTask.priority],["CATEGORY",selectedTask.category||"—"]].map(function(item){
              return e("div",{key:item[0],style:{color:"#5a5e50"}}, item[0], e("br"), e("span",{style:{color:"#c8d0b8",fontSize:12}}, item[1]));
            })
          ),
          e("div",{style:{fontSize:10,color:"#5a5e50",marginBottom:6,letterSpacing:1,textTransform:"uppercase"}}, "Update Status"),
          e("div",{style:{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}},
            ["Open","In Progress","On Hold","Complete"].map(function(s){
              return e("button",{key:s,onClick:function(){updateTaskStatus(selectedTask.id,s);},
                style:{background:selectedTask.status===s?(STATUS_COLORS[s]||"#888")+"33":"transparent",color:selectedTask.status===s?(STATUS_COLORS[s]||"#888"):"#5a5e50",border:"1px solid "+(selectedTask.status===s?(STATUS_COLORS[s]||"#888")+"66":"#2e3028"),padding:"4px 9px",fontSize:10,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:1}}, s);
            })
          ),
          e("button",{onClick:function(){deleteTask(selectedTask.id);},style:{background:"transparent",color:"#c0503a55",border:"1px solid #c0503a22",padding:"5px 12px",fontSize:10,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:1,width:"100%"}}, "Delete Task")
        )
      ),

      // DIARY
      !loading && view==="diary" && e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}},
        e("div",{style:{background:"#22241e",border:"1px solid #2e3028",padding:18}},
          e("div",{style:{fontSize:10,letterSpacing:3,color:"#9e7bb5",marginBottom:16,textTransform:"uppercase"}}, "📓 Daily Log"),
          e("div",{style:{marginBottom:12}},
            e("label",{style:{fontSize:10,color:"#5a5e50",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:5}}, "Date"),
            e("input",{type:"date",value:diaryDate,onChange:function(ev){setDiaryDate(ev.target.value);},style:Object.assign({},S,{width:"100%",boxSizing:"border-box"})})
          ),
          e("div",{style:{marginBottom:14}},
            e("label",{style:{fontSize:10,color:"#5a5e50",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:5}}, "Notes"),
            e("textarea",{value:diaryNotes,onChange:function(ev){setDiaryNotes(ev.target.value);},placeholder:"What happened today? Key decisions, issues, weather, visitors…",style:Object.assign({},S,{width:"100%",boxSizing:"border-box",minHeight:90,resize:"vertical",fontSize:12,lineHeight:1.6})})
          ),
          e("div",{style:{marginBottom:14}},
            e("label",{style:{fontSize:10,color:"#5a5e50",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}, "Hours by Area"),
            e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}},
              Object.entries(SOURCES).map(function(entry){
                var key = entry[0]; var src = entry[1];
                return e("div",{key:key,style:{display:"flex",alignItems:"center",gap:8,background:"#1a1c18",padding:"6px 10px",border:"1px solid #2e3028"}},
                  e("span",{style:{fontSize:11,flex:1,color:"#b0a890"}}, src.icon+" "+src.label),
                  e("input",{type:"number",min:"0",max:"16",step:"0.5",value:diaryHours[key]||"",onChange:function(ev){var h=Object.assign({},diaryHours); h[key]=ev.target.value; setDiaryHours(h);},placeholder:"0",style:{width:44,background:"transparent",border:"none",borderBottom:"1px solid #3a3e30",color:src.color,fontSize:13,textAlign:"right",fontFamily:"inherit",outline:"none"}}),
                  e("span",{style:{fontSize:10,color:"#5a5e50"}}, "h")
                );
              })
            )
          ),
          e("div",{style:{display:"flex",alignItems:"center",gap:12}},
            e("button",{onClick:saveDiary,disabled:savingDiary,style:{background:"#9e7bb5",color:"#fff",border:"none",padding:"9px 24px",fontSize:11,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:1}}, savingDiary?"Saving…":"Save Entry"),
            diarySuccess && e("span",{style:{fontSize:11,color:"#5a8a6a"}}, "✓ Saved")
          )
        ),
        e("div",{style:{background:"#22241e",border:"1px solid #2e3028",padding:18}},
          e("div",{style:{fontSize:10,letterSpacing:3,color:"#9e7bb5",marginBottom:16,textTransform:"uppercase"}}, "Recent Entries"),
          diaryEntries.length===0 && e("div",{style:{color:"#5a5e50",fontSize:12}}, "No entries yet."),
          e("div",{style:{display:"flex",flexDirection:"column",gap:10,maxHeight:480,overflowY:"auto"}},
            diaryEntries.map(function(entry){
              var logs = timeLogs.filter(function(l){return l.diary_entry_id===entry.id;});
              var totalH = logs.reduce(function(a,l){return a+parseFloat(l.hours);},0);
              return e("div",{key:entry.id,style:{borderLeft:"3px solid #9e7bb544",padding:"10px 14px",background:"#1a1c18"}},
                e("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:5}},
                  e("span",{style:{fontSize:11,color:"#c8a96e"}}, entry.entry_date),
                  totalH>0 && e("span",{style:{fontSize:10,color:"#9e7bb5"}}, totalH+"h logged")
                ),
                entry.notes && e("div",{style:{fontSize:12,color:"#b0a890",lineHeight:1.6,marginBottom:6}}, entry.notes),
                logs.length>0 && e("div",{style:{display:"flex",flexWrap:"wrap",gap:5}},
                  logs.map(function(l,i){
                    return e("span",{key:i,style:{fontSize:10,background:(SOURCES[l.source]?SOURCES[l.source].color:"#888")+"22",color:SOURCES[l.source]?SOURCES[l.source].color:"#888",border:"1px solid "+(SOURCES[l.source]?SOURCES[l.source].color:"#888")+"44",padding:"2px 7px"}},
                      (SOURCES[l.source]?SOURCES[l.source].icon:"")+" "+l.hours+"h"
                    );
                  })
                )
              );
            })
          )
        )
      ),

      // ARABLE
      !loading && view==="arable" && e("div",null,
        e("div",{style:{fontSize:10,letterSpacing:3,color:"#4a7fa5",marginBottom:16,textTransform:"uppercase"}}, "🌱 Arable Rotation Calendar"),
        e("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}},
          ARABLE_MONTHS.map(function(m,i){
            return e("div",{key:m.month,style:{background:i===currentMonth?"#1e2a1e":"#22241e",border:"1px solid "+(i===currentMonth?"#4a7fa5":"#2e3028"),borderTop:i===currentMonth?"3px solid #4a7fa5":"3px solid transparent",padding:14}},
              e("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:7}},
                e("span",{style:{fontFamily:"'Playfair Display',serif",fontSize:15,color:i===currentMonth?"#4a7fa5":"#c8d0b8"}}, m.month),
                i===currentMonth && e("span",{style:{fontSize:9,color:"#4a7fa5",letterSpacing:2,textTransform:"uppercase"}}, "Now")
              ),
              e("div",{style:{fontSize:10,color:"#5a6a5a",marginBottom:7}}, m.crops.join(" · ")),
              m.tasks.map(function(task,j){
                return e("div",{key:j,style:{fontSize:11,color:"#8a9080",padding:"3px 0",borderBottom:"1px solid #2a2c24",display:"flex",gap:5}},
                  e("span",{style:{color:"#3a5a3a"}}, "▸"), task
                );
              })
            );
          })
        )
      ),

      // REPORT
      !loading && view==="report" && e("div",{style:{maxWidth:780}},
        e("div",{style:{fontSize:10,letterSpacing:3,color:"#c8a96e",marginBottom:16,textTransform:"uppercase"}}, "📊 Monthly Report — "+nowLabel),
        e("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}},
          [["Completed",completeCount,"#5a8a6a"],["Open",openCount,"#c8a96e"],["High Priority",highPriority,"#c0503a"],["Hours",totalHoursMonth+"h","#9e7bb5"]].map(function(item){
            return e("div",{key:item[0],style:{background:"#22241e",border:"1px solid #2e3028",borderTop:"3px solid "+item[2],padding:"14px 16px"}},
              e("div",{style:{fontSize:28,fontFamily:"'Playfair Display',serif",color:item[2],lineHeight:1}}, item[1]),
              e("div",{style:{fontSize:10,color:"#6a6e5e",letterSpacing:2,marginTop:4,textTransform:"uppercase"}}, item[0])
            );
          })
        ),
        e("div",{style:{background:"#22241e",border:"1px solid #2e3028",padding:18,marginBottom:12}},
          e("div",{style:{fontSize:10,letterSpacing:2,color:"#9e7bb5",marginBottom:12,textTransform:"uppercase"}}, "Time Allocation This Month"),
          e(HoursChart,{logs:timeLogs})
        ),
        e("div",{style:{background:"#22241e",border:"1px solid #2e3028",padding:18,marginBottom:12}},
          e("div",{style:{fontSize:10,letterSpacing:2,color:"#5a8a6a",marginBottom:12,textTransform:"uppercase"}}, "Recently Completed"),
          tasks.filter(function(t){return t.status==="Complete";}).slice(0,10).map(function(t){
            return e("div",{key:t.id,style:{display:"flex",gap:10,padding:"5px 0",borderBottom:"1px solid #2a2c24",fontSize:11}},
              e("span",{style:{color:SOURCES[t.source]?SOURCES[t.source].color:"#888"}}, SOURCES[t.source]?SOURCES[t.source].icon:""),
              e("span",{style:{flex:1,color:"#6a7060",textDecoration:"line-through"}}, t.title),
              t.due && e("span",{style:{color:"#5a5e50"}}, t.due)
            );
          })
        ),
        e("div",{style:{background:"#22241e",border:"1px solid #2e3028",padding:18,marginBottom:18}},
          e("div",{style:{fontSize:10,letterSpacing:2,color:"#c0503a",marginBottom:12,textTransform:"uppercase"}}, "High Priority Open"),
          tasks.filter(function(t){return t.priority==="High"&&t.status!=="Complete";}).slice(0,10).map(function(t){
            return e("div",{key:t.id,style:{display:"flex",gap:10,padding:"5px 0",borderBottom:"1px solid #2a2c24",fontSize:11}},
              e("span",{style:{color:SOURCES[t.source]?SOURCES[t.source].color:"#888"}}, SOURCES[t.source]?SOURCES[t.source].icon:""),
              e("span",{style:{flex:1,color:"#c8d0b8"}}, t.title),
              e("span",{style:{color:"#6a6e5e"}}, t.assignee||"—")
            );
          })
        ),
        e("button",{onClick:function(){generatePDF(tasks,diaryEntries,timeLogs,nowLabel);},style:{background:"#c8a96e",color:"#1a1c18",border:"none",padding:"12px 28px",fontSize:12,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:2,display:"block",width:"100%"}},
          "↓ Download Report for CEO"
        )
      ),

      // EMAIL
      !loading && view==="email" && e("div",{style:{maxWidth:680}},
        e("div",{style:{fontSize:10,letterSpacing:3,color:"#c8a96e",marginBottom:16,textTransform:"uppercase"}}, "📧 Email Filing System"),
        [
          {title:"Folder Structure",color:"#c8a96e",items:[
            {label:"INBOX",desc:"Active jobs only. Unread = needs action."},
            {label:"01_ARABLE",desc:"Advisor recs, Omnia outputs, Steve correspondence"},
            {label:"02_CATTLE",desc:"Vet, feed, silage, movement records"},
            {label:"03_SHEEP",desc:"Vet, feed, movement records, shearing"},
            {label:"04_PIGS",desc:"Pig Hub, Harbro, Deerpark, slurry, milling"},
            {label:"05_HORSES",desc:"Vet, farrier, feed — owner's wife"},
            {label:"06_FARM_GENERAL",desc:"Maintenance, tracks, machinery, fencing"},
            {label:"07_CHAPEL_FARM",desc:"James via PA/CEO, projects, capital works"},
            {label:"08_COW_CLOSE",desc:"Owner's residence tasks"},
            {label:"09_PROPERTY",desc:"Rental properties, staff housing"},
            {label:"10_FINANCE",desc:"POs, invoices, delivery notes"},
            {label:"_ARCHIVE/Year",desc:"Completed — move annually"},
          ]},
          {title:"Reference Numbering",color:"#4a7fa5",items:[
            {label:"Format: EMAIL-YYYY-NNN",desc:"e.g. EMAIL-2026-051"},
            {label:"Add ref to task",desc:"Log in the Email Ref field when creating a task"},
            {label:"Subject prefix",desc:"[EMAIL-2026-051] Cottage roof repair"},
          ]},
          {title:"Rules to Set Up",color:"#5a8a6a",items:[
            {label:"Owner's wife",desc:"Filter her address → auto-label HORSES"},
            {label:"James PA/CEO",desc:"Filter their domain → auto-label CHAPEL_FARM"},
            {label:"Omnia/advisor",desc:"Filter sender → auto-move to 01_ARABLE"},
            {label:"Harbro/Deerpark",desc:"Filter → auto-label PIGS"},
          ]},
        ].map(function(section){
          return e("div",{key:section.title,style:{background:"#22241e",border:"1px solid #2e3028",borderLeft:"4px solid "+section.color,padding:16,marginBottom:10}},
            e("div",{style:{fontSize:10,letterSpacing:2,color:section.color,marginBottom:10,textTransform:"uppercase"}}, section.title),
            section.items.map(function(item,i){
              return e("div",{key:i,style:{display:"grid",gridTemplateColumns:"180px 1fr",gap:10,padding:"6px 0",borderBottom:"1px solid #2a2c24"}},
                e("span",{style:{fontSize:11,color:"#c8d0b8"}}, item.label),
                e("span",{style:{fontSize:11,color:"#6a7060",lineHeight:1.5}}, item.desc)
              );
            })
          );
        })
      )
    )
  );
}

