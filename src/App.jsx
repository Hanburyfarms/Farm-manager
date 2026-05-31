import { useState, useEffect } from "react";

const SUPABASE_URL = "https://hfmqdldtcmnsejfzkpfe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmbXFkbGR0Y21uc2VqZnprcGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDgwNTksImV4cCI6MjA5NTc4NDA1OX0.6YkuD1uGnNv8YoZwa-L87st-ODn0vNIBBkoKW6GxLiA";

const api = async (path, method = "GET", body) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": method === "POST" ? "return=representation" : "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const SOURCES = {
  ARABLE:   { label: "Arable",         color: "#4a7fa5", icon: "ðŸŒ±" },
  CATTLE:   { label: "Cattle",          color: "#8a6a3a", icon: "ðŸ„" },
  SHEEP:    { label: "Sheep",           color: "#7a9a6a", icon: "ðŸ‘" },
  PIGS:     { label: "Pigs",            color: "#c47a5a", icon: "ðŸ·" },
  FARM:     { label: "Farm (General)",  color: "#6a7a5a", icon: "ðŸšœ" },
  HORSES:   { label: "Horses",          color: "#9e7bb5", icon: "ðŸ´" },
  CHAPEL:   { label: "Chapel Farm",     color: "#5a8a7a", icon: "â›ª" },
  COWCLOSE: { label: "Cow Close",       color: "#c8a96e", icon: "ðŸ " },
  PROPERTY: { label: "Property",        color: "#7a6a9a", icon: "ðŸ¡" },
};

const STAFF = ["Self", "Farm Team", "Operator 1", "Operator 2", "Contractor"];
const PRIORITY = ["High", "Medium", "Low"];

const SEED_TASKS = [
  {title:"Scrap metal skip order",source:"FARM",priority:"Low",assignee:"Self",status:"Complete",due:"2026-05-13",notes:"not possible",ref:"",category:"General"},
  {title:"XS farms recycling fees discuss re land area",source:"FARM",priority:"Medium",assignee:"Self",status:"Complete",due:"2026-05-13",notes:"",ref:"",category:"General"},
  {title:"Create diesel usage sheets",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-14",notes:"",ref:"",category:"General"},
  {title:"Fencing: Fence to exclude grooby stock from external condenser units",source:"FARM",priority:"High",assignee:"Farm Team",status:"Complete",due:"2026-04-14",notes:"",ref:"",category:"Fencing"},
  {title:"Flat rolling: Confirm desired effect â€” do not roll for aesthetics",source:"HORSES",priority:"High",assignee:"Farm Team",status:"Complete",due:"2026-04-17",notes:"Only rolled cow close as conditions too dry.",ref:"",category:"Flat rolling"},
  {title:"Tree Work: Chestnut tree burley triangle",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Tree Work"},
  {title:"Building Maintenance: Remove ply panelling from workshop walls",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Building Maintenance"},
  {title:"MOT booked in for 15.04.26 â€” Eden Tyres",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"General"},
  {title:"Flat rolling: Silage fields",source:"CATTLE",priority:"High",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Flat rolling"},
  {title:"Tidy: Scrap metal removal from hillside yard â€” rat habitat",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Tidy"},
  {title:"Pigs: Prep pen for weaning and AI",source:"PIGS",priority:"High",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Livestock"},
  {title:"Tree Work: Ash at old row",source:"PROPERTY",priority:"Medium",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Tree Work"},
  {title:"Pigs: Book in next milling date",source:"PIGS",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Livestock"},
  {title:"Stock: Herbal Ley â€” order placed",source:"ARABLE",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"ordered",ref:"",category:"Stock"},
  {title:"Stock: AB9 / Winter bird food / Game cover",source:"ARABLE",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"ordered",ref:"",category:"Stock"},
  {title:"Pigs: Pig Hub movement records via HVN",source:"PIGS",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Livestock"},
  {title:"Pigs: AI Sow â€” call Deerpark Pigs",source:"PIGS",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Livestock"},
  {title:"Pigs: Wean sow, AI Tuesday afternoon",source:"PIGS",priority:"High",assignee:"Farm Team",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Livestock"},
  {title:"Stock: Drive farm with Austin â€” game covers action plan",source:"ARABLE",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-24",notes:"",ref:"",category:"Stock"},
  {title:"Equipment: Combine yield monitoring â€” discuss during service",source:"ARABLE",priority:"High",assignee:"Self",status:"Complete",due:"2026-06-24",notes:"",ref:"",category:"Equipment"},
  {title:"Stock: CIPM2",source:"ARABLE",priority:"High",assignee:"Self",status:"Complete",due:"2026-06-24",notes:"",ref:"",category:"Stock"},
  {title:"Stock: Red Diesel",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-27",notes:"",ref:"",category:"Stock"},
  {title:"Farm security â€” cameras and alarm system",source:"FARM",priority:"Medium",assignee:"Self",status:"Complete",due:"2026-04-28",notes:"Co contacted for quotes.",ref:"",category:"General"},
  {title:"Book NFU Visit",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-28",notes:"",ref:"",category:"General"},
  {title:"Stock: Adblue",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-28",notes:"",ref:"",category:"Stock"},
  {title:"Stock: White Diesel",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-28",notes:"Not required",ref:"",category:"Stock"},
  {title:"Stock: Red diesel order",source:"FARM",priority:"High",assignee:"Self",status:"Complete",due:"2026-04-28",notes:"",ref:"",category:"Stock"},
  {title:"Somerby supplier form",source:"ARABLE",priority:"Medium",assignee:"Self",status:"Complete",due:"2026-04-29",notes:"",ref:"",category:"General"},
  {title:"Rutland catering account",source:"FARM",priority:"Medium",assignee:"Self",status:"Complete",due:"2026-04-29",notes:"",ref:"",category:"General"},
  {title:"Fencing: Gate at dog kennel â€” second hand if possible",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Hedge below chapel â€” brash to clear",source:"CHAPEL",priority:"Medium",assignee:"Farm Team",status:"Open",due:"2026-05-01",notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Repair all yards and feed faces for next season",source:"FARM",priority:"High",assignee:"Farm Team",status:"Open",due:"2026-10-01",notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Post struck by trailer â€” gate no longer lines up, currently chained",source:"FARM",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Building Maintenance: Empty and repair all gutters",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Building Maintenance"},
  {title:"Tidy: Trommel screen rubble and burn piles â€” spread on fields",source:"FARM",priority:"Low",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Tidy"},
  {title:"Building Maintenance: Jet wash fibre cement panels, apply coating, replace damaged",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Building Maintenance"},
  {title:"Tidy: Crusher â€” upcycle building rubble into hardcore for tracks",source:"FARM",priority:"Low",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Tidy"},
  {title:"Ditches: Systematically clear and reshape ditches around the farm",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Ditches"},
  {title:"Tidy: Separate useful materials from rubble at building laydown area",source:"FARM",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tidy"},
  {title:"Tracks: Hardcore/resurface catching pen â€” surface prepped, needs completing",source:"FARM",priority:"High",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Earthworks: Reshape and destroy rat burrows and habitat",source:"ARABLE",priority:"High",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Earthworks"},
  {title:"Building Maintenance: Move to new workshop â€” rat free machinery area",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Building Maintenance"},
  {title:"Tracks: Cow close back drive",source:"COWCLOSE",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Tracks: Cow close front drive",source:"COWCLOSE",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Tracks: Exton Lane",source:"PROPERTY",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Tracks: Walk in cooler / prep room approach",source:"PROPERTY",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Tracks: Engine shed",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Tree Work: As per survey",source:"FARM",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tree Work"},
  {title:"Woodchip: Chip remaining timber for summer usage",source:"CHAPEL",priority:"High",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Woodchip"},
  {title:"Record keeping: Migrate paper records for last 4 years",source:"ARABLE",priority:"Low",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Record keeping"},
  {title:"Record keeping: Upload drainage drawings to map layers",source:"ARABLE",priority:"Low",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Record keeping"},
  {title:"Record keeping: Confirm all 2026 crop year dates and plans with Steve",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Record keeping"},
  {title:"Pigs: Return unwanted minerals to Harbro",source:"PIGS",priority:"High",assignee:"Self",status:"In Progress",due:null,notes:"Discussed with Harbro but still ongoing",ref:"",category:"Livestock"},
  {title:"Fencing: Remove fence village green",source:"PROPERTY",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Mucking out: Discuss new muck area â€” access for turning, create long windrow",source:"FARM",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Mucking Out"},
  {title:"Grassland: Call pig slurry contractor â€” application 1st week of June",source:"PIGS",priority:"High",assignee:"Self",status:"In Progress",due:null,notes:"Called but leaving open until date confirmed",ref:"",category:"Grassland"},
  {title:"Equipment: Section control â€” migrate manual to digital, Chandlers consolidation",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Equipment"},
  {title:"Work up job spec for arable operator (employee or contractor)",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Training: Spray certificates PA2, PA4, PA6",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Training"},
  {title:"Training: BASIS",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Training"},
  {title:"Training: FACTS",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Training"},
  {title:"Training: Chainsaw",source:"FARM",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Training"},
  {title:"Nutrient, Soil Health, IPM plans for SFI",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Building Maintenance: Bunding â€” legalities and risk mitigation",source:"FARM",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Building Maintenance"},
  {title:"Pigs: Follow up refund â€” ad lib feeder paid for 1t, collected smaller",source:"PIGS",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Livestock"},
  {title:"Fert Canary Grass 40kg/ha â€” discuss with Austin",source:"PROPERTY",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Fencing: Barnsdale meadows â€” cut bramble, clear rubbish, fence",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Gate posts â€” discuss with David/Joss",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Stock: Calculate fert requirements",source:"ARABLE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"at meeting with BTD",ref:"",category:"Stock"},
  {title:"Mucking out: Final muck out of all sheds",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Mucking Out"},
  {title:"Building Maintenance: Clear rubble hillside barn",source:"PROPERTY",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Building Maintenance"},
  {title:"Footpath turner rail â€” Kubota with topper through field",source:"FARM",priority:"High",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Equipment: Combine yield mapping",source:"ARABLE",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Equipment"},
  {title:"Tree Work: Remove timber from burley triangle",source:"PROPERTY",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Tree Work"},
  {title:"Fencing: Cow close big field â€” single strand electric",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Cow close small field â€” corner fence",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Grooby's small paddock",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: Graveyard, grooby boundary",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fencing: The mound gate posts",source:"FARM",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fill rabbit holes â€” the mound",source:"FARM",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Move logs for horse jumps",source:"HORSES",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Earthworks: Move soil from overdyke",source:"FARM",priority:"Low",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Earthworks"},
  {title:"Business plan feed",source:"FARM",priority:"Low",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Manhole covers for septic tank at office",source:"PROPERTY",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Prestressed concrete and freestanding panels for grain shed",source:"ARABLE",priority:"Medium",assignee:"Self",status:"In Progress",due:null,notes:"Order placed, waiting for invoice",ref:"",category:"General"},
  {title:"Discuss trade in Joss's ATV for new under warranty",source:"COWCLOSE",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Fencing: Order hi-tensile wire, posts and insultube â€” Progressive Farming",source:"FARM",priority:"High",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Fencing"},
  {title:"Fix tree guard in park field",source:"FARM",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Hay ring move from Park",source:"HORSES",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"General"},
  {title:"Tracks: Chapel to Langham lane",source:"CHAPEL",priority:"Medium",assignee:"Self",status:"Open",due:null,notes:"",ref:"",category:"Tracks"},
  {title:"Earthworks: Pond at chapel â€” overflow and runoff",source:"CHAPEL",priority:"Medium",assignee:"Farm Team",status:"Open",due:null,notes:"",ref:"",category:"Earthworks"},
];

const ARABLE_MONTHS = [
  { month: "Jan", crops: ["Winter Wheat", "Winter Barley", "OSR"], tasks: ["Fungicide T0 OSR", "Crop walking", "Advisor meeting"] },
  { month: "Feb", crops: ["Winter Wheat", "Winter Barley", "OSR"], tasks: ["Fertiliser N1", "Pre-em herbicides", "Slug pellet check"] },
  { month: "Mar", crops: ["Winter Wheat", "Winter Barley", "OSR"], tasks: ["N2 application", "T0 fungicide wheat", "Advisor meeting"] },
  { month: "Apr", crops: ["Winter Wheat", "OSR", "Spring Barley"], tasks: ["T1 fungicide", "Spring drilling", "Growth regulator"] },
  { month: "May", crops: ["Winter Wheat", "Winter Barley", "Spring Barley"], tasks: ["T2 fungicide", "Insecticide OSR", "Advisor meeting"] },
  { month: "Jun", crops: ["All cereals", "OSR"], tasks: ["T3 ear spray", "OSR desiccation prep", "Harvest planning"] },
  { month: "Jul", crops: ["OSR", "Winter Barley"], tasks: ["OSR harvest", "Winter barley harvest", "Straw baling"] },
  { month: "Aug", crops: ["Winter Wheat", "Spring Barley"], tasks: ["Wheat harvest", "Spring barley harvest", "Stubble work"] },
  { month: "Sep", crops: ["Cover crops", "Autumn drilling"], tasks: ["Subsoiling", "Ploughing", "Advisor meeting"] },
  { month: "Oct", crops: ["Winter Wheat", "Winter Barley", "OSR"], tasks: ["Drilling programme", "Pre-em herbicides", "Soil sampling"] },
  { month: "Nov", crops: ["Winter Wheat", "OSR"], tasks: ["Post-em herbicides", "Slug control", "Drainage work"] },
  { month: "Dec", crops: ["All winter crops"], tasks: ["Crop walking", "Equipment maintenance", "Advisor review"] },
];

const statusColors = { "Open": "#c8a96e", "In Progress": "#4a7fa5", "Complete": "#5a8a6a", "On Hold": "#888" };

export default function FarmDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("dashboard");
  const [filterSource, setFilterSource] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterAssignee, setFilterAssignee] = useState("ALL");
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentMonth] = useState(new Date().getMonth());
  const [showComplete, setShowComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", source: "FARM", priority: "Medium", assignee: "Self", status: "Open", due: "", notes: "", ref: "", category: "General" });

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api("tasks?order=id.asc");
      setTasks(data || []);
    } catch (e) {
      setError("Could not load tasks: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      const payload = SEED_TASKS.map(t => ({
        title: t.title, source: t.source, priority: t.priority,
        assignee: t.assignee, status: t.status,
        due: t.due || null, notes: t.notes, ref: t.ref, category: t.category,
        date_added: new Date().toISOString().slice(0,10),
      }));
      await api("tasks", "POST", payload);
      await loadTasks();
    } catch (e) {
      setError("Seed failed: " + e.message);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const addTask = async () => {
    if (!newTask.title) return;
    setSaving(true);
    try {
      const payload = { ...newTask, due: newTask.due || null, date_added: new Date().toISOString().slice(0,10) };
      const result = await api("tasks", "POST", payload);
      setTasks(prev => [...prev, result[0]]);
      setNewTask({ title: "", source: "FARM", priority: "Medium", assignee: "Self", status: "Open", due: "", notes: "", ref: "", category: "General" });
      setShowAddTask(false);
    } catch (e) {
      setError("Could not save task: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await api(`tasks?id=eq.${id}`, "PATCH", { status });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      if (selectedTask?.id === id) setSelectedTask(prev => ({ ...prev, status }));
    } catch (e) {
      setError("Could not update task.");
    }
  };

  const deleteTask = async (id) => {
    try {
      await api(`tasks?id=eq.${id}`, "DELETE");
      setTasks(prev => prev.filter(t => t.id !== id));
      setSelectedTask(null);
    } catch (e) {
      setError("Could not delete task.");
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (!showComplete && t.status === "Complete") return false;
    if (filterSource !== "ALL" && t.source !== filterSource) return false;
    if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
    if (filterAssignee !== "ALL" && t.assignee !== filterAssignee) return false;
    return true;
  });

  const openCount = tasks.filter(t => t.status === "Open").length;
  const inProgressCount = tasks.filter(t => t.status === "In Progress").length;
  const highPriority = tasks.filter(t => t.priority === "High" && t.status !== "Complete").length;
  const completeCount = tasks.filter(t => t.status === "Complete").length;
  const thisMonth = ARABLE_MONTHS[currentMonth];
  const nextMonth = ARABLE_MONTHS[(currentMonth + 1) % 12];

  const sel = { background: "#1a1c18", border: "1px solid #3a3e30", color: "#b0a890", padding: "7px 12px", fontSize: 12, fontFamily: "inherit", cursor: "pointer" };

  return (
    <div style={{ minHeight: "100vh", background: "#1a1c18", fontFamily: "'DM Mono','Courier New',monospace", color: "#e8e0d0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ borderBottom: "1px solid #2e3028", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1a1c18", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "14px 0" }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: "#c8a96e", letterSpacing: 1 }}>ESTATE MANAGER</span>
          <span style={{ fontSize: 10, color: "#5a5e50", letterSpacing: 3, textTransform: "uppercase" }}>Farm Control</span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {[["dashboard","Overview"],["tasks","All Tasks"],["arable","Arable"],["email","Email Guide"]].map(([key,label]) => (
            <button key={key} onClick={() => setView(key)} style={{ background: view===key?"#2e3028":"transparent", color: view===key?"#c8a96e":"#6a6e5e", border:"none", padding:"8px 14px", cursor:"pointer", fontSize:11, letterSpacing:1, textTransform:"uppercase" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1300, margin: "0 auto" }}>

        {/* Error banner */}
        {error && (
          <div style={{ background:"#3a1a1a", border:"1px solid #c0503a", color:"#c0503a", padding:"10px 16px", marginBottom:16, fontSize:12, display:"flex", justifyContent:"space-between" }}>
            {error}
            <button onClick={()=>setError(null)} style={{background:"transparent",border:"none",color:"#c0503a",cursor:"pointer"}}>âœ•</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:60, color:"#5a5e50", fontSize:13 }}>
            Loading tasks from database...
          </div>
        )}

        {/* Empty state â€” offer to seed */}
        {!loading && tasks.length === 0 && (
          <div style={{ textAlign:"center", padding:60 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:"#c8a96e", marginBottom:12 }}>Database connected</div>
            <div style={{ color:"#6a6e5e", fontSize:13, marginBottom:24 }}>No tasks yet. Load your existing 91 tasks to get started.</div>
            <button onClick={seedDatabase} disabled={seeding} style={{ background:"#c8a96e", color:"#1a1c18", border:"none", padding:"12px 28px", fontSize:13, cursor:"pointer", fontFamily:"inherit", textTransform:"uppercase", letterSpacing:1 }}>
              {seeding ? "Loading tasks..." : "Load My Tasks"}
            </button>
          </div>
        )}

        {/* DASHBOARD */}
        {!loading && tasks.length > 0 && view === "dashboard" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
              {[["Open Jobs",openCount,"#c8a96e"],["In Progress",inProgressCount,"#4a7fa5"],["High Priority",highPriority,"#c0503a"],["Completed",completeCount,"#5a8a6a"]].map(([label,value,accent]) => (
                <div key={label} style={{ background:"#22241e", border:"1px solid #2e3028", borderTop:`3px solid ${accent}`, padding:"16px 18px" }}>
                  <div style={{ fontSize:34, fontFamily:"'Playfair Display',serif", color:accent, lineHeight:1 }}>{value}</div>
                  <div style={{ fontSize:10, color:"#6a6e5e", letterSpacing:2, marginTop:5, textTransform:"uppercase" }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={{ background:"#22241e", border:"1px solid #2e3028", padding:18 }}>
                <div style={{ fontSize:10, letterSpacing:3, color:"#c0503a", marginBottom:14, textTransform:"uppercase" }}>âš  Urgent / High Priority</div>
                {tasks.filter(t => t.priority==="High" && t.status!=="Complete").slice(0,8).map(t => (
                  <div key={t.id} onClick={() => { setSelectedTask(t); setView("tasks"); }} style={{ borderLeft:`3px solid ${SOURCES[t.source]?.color}`, padding:"8px 10px", marginBottom:6, background:"#1a1c18", cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#252720"} onMouseLeave={e=>e.currentTarget.style.background="#1a1c18"}>
                    <div style={{ fontSize:12, color:"#e8e0d0", marginBottom:2 }}>{t.title}</div>
                    <div style={{ display:"flex", gap:10, fontSize:10, color:"#5a5e50" }}>
                      <span>{SOURCES[t.source]?.icon} {SOURCES[t.source]?.label}</span>
                      <span>â†’ {t.assignee||"Unassigned"}</span>
                      {t.due && <span>ðŸ“… {t.due}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background:"#22241e", border:"1px solid #2e3028", padding:18 }}>
                <div style={{ fontSize:10, letterSpacing:3, color:"#c8a96e", marginBottom:14, textTransform:"uppercase" }}>Jobs by Area</div>
                {Object.entries(SOURCES).map(([key,src]) => {
                  const open = tasks.filter(t => t.source===key && t.status!=="Complete").length;
                  const total = tasks.filter(t => t.source===key).length;
                  const high = tasks.filter(t => t.source===key && t.priority==="High" && t.status!=="Complete").length;
                  return (
                    <div key={key} onClick={() => { setFilterSource(key); setView("tasks"); setShowComplete(false); }} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0", borderBottom:"1px solid #2e3028", cursor:"pointer" }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:src.color, flexShrink:0 }} />
                      <span style={{ flex:1, fontSize:12, color:"#b0a890" }}>{src.icon} {src.label}</span>
                      {high > 0 && <span style={{ fontSize:9, color:"#c0503a" }}>âš  {high}</span>}
                      <span style={{ fontSize:10, color:"#5a5e50" }}>{total}</span>
                      <span style={{ background:open>0?src.color+"33":"transparent", color:open>0?src.color:"#3a3e30", padding:"2px 9px", fontSize:11, border:`1px solid ${open>0?src.color+"55":"#2e3028"}`, minWidth:55, textAlign:"center" }}>{open} open</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ background:"#22241e", border:"1px solid #2e3028", padding:18 }}>
                <div style={{ fontSize:10, letterSpacing:3, color:"#4a7fa5", marginBottom:4, textTransform:"uppercase" }}>ðŸŒ± Arable â€” {thisMonth.month}</div>
                <div style={{ fontSize:10, color:"#5a5e50", marginBottom:12 }}>{thisMonth.crops.join(" Â· ")}</div>
                {thisMonth.tasks.map((task,i) => (
                  <div key={i} style={{ display:"flex", gap:8, padding:"5px 0", borderBottom:"1px solid #2a2c24", fontSize:12 }}>
                    <span style={{ color:"#4a7fa5" }}>â–¸</span><span style={{ color:"#c8d0b8" }}>{task}</span>
                  </div>
                ))}
              </div>

              <div style={{ background:"#22241e", border:"1px solid #2e3028", padding:18 }}>
                <div style={{ fontSize:10, letterSpacing:3, color:"#4a7fa5", marginBottom:14, textTransform:"uppercase" }}>âŸ³ In Progress</div>
                {tasks.filter(t => t.status==="In Progress").map(t => (
                  <div key={t.id} onClick={() => { setSelectedTask(t); setView("tasks"); setShowComplete(true); }} style={{ borderLeft:`3px solid ${SOURCES[t.source]?.color}`, padding:"8px 10px", marginBottom:6, background:"#1a1c18", cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#252720"} onMouseLeave={e=>e.currentTarget.style.background="#1a1c18"}>
                    <div style={{ fontSize:12, color:"#e8e0d0", marginBottom:2 }}>{t.title}</div>
                    {t.notes && <div style={{ fontSize:10, color:"#6a7060", fontStyle:"italic" }}>{t.notes}</div>}
                  </div>
                ))}
                {tasks.filter(t=>t.status==="In Progress").length===0 && <div style={{color:"#5a5e50",fontSize:12}}>Nothing in progress.</div>}
              </div>
            </div>
          </div>
        )}

        {/* TASKS */}
        {!loading && tasks.length > 0 && view === "tasks" && (
          <div style={{ display:"grid", gridTemplateColumns:selectedTask?"1fr 360px":"1fr", gap:14 }}>
            <div>
              <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
                <button onClick={()=>setShowAddTask(!showAddTask)} style={{ background:"#c8a96e", color:"#1a1c18", border:"none", padding:"8px 16px", fontSize:11, letterSpacing:1, cursor:"pointer", textTransform:"uppercase", fontFamily:"inherit" }}>+ New Task</button>
                <select value={filterSource} onChange={e=>setFilterSource(e.target.value)} style={sel}>
                  <option value="ALL">All Areas</option>
                  {Object.entries(SOURCES).map(([k,s])=><option key={k} value={k}>{s.icon} {s.label}</option>)}
                </select>
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={sel}>
                  <option value="ALL">All Statuses</option>
                  {["Open","In Progress","On Hold","Complete"].map(s=><option key={s}>{s}</option>)}
                </select>
                <select value={filterAssignee} onChange={e=>setFilterAssignee(e.target.value)} style={sel}>
                  <option value="ALL">All Assignees</option>
                  {STAFF.map(s=><option key={s}>{s}</option>)}
                </select>
                <button onClick={()=>setShowComplete(!showComplete)} style={{ background:showComplete?"#5a8a6a22":"transparent", color:showComplete?"#5a8a6a":"#6a6e5e", border:`1px solid ${showComplete?"#5a8a6a44":"#3a3e30"}`, padding:"7px 12px", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                  {showComplete?"âœ“ Showing Completed":"Show Completed"}
                </button>
                <button onClick={loadTasks} style={{ background:"transparent", color:"#6a6e5e", border:"1px solid #3a3e30", padding:"7px 12px", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>â†» Refresh</button>
                <span style={{ fontSize:11, color:"#5a5e50" }}>{filteredTasks.length} tasks</span>
              </div>

              {showAddTask && (
                <div style={{ background:"#22241e", border:"1px solid #c8a96e44", padding:18, marginBottom:14 }}>
                  <div style={{ fontSize:10, letterSpacing:2, color:"#c8a96e", marginBottom:14, textTransform:"uppercase" }}>New Task</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <input placeholder="Task title *" value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})}
                      style={{ gridColumn:"1/-1", ...sel, color:"#e8e0d0", padding:"8px 10px", fontSize:13 }} />
                    <select value={newTask.source} onChange={e=>setNewTask({...newTask,source:e.target.value})} style={sel}>
                      {Object.entries(SOURCES).map(([k,s])=><option key={k} value={k}>{s.icon} {s.label}</option>)}
                    </select>
                    <select value={newTask.priority} onChange={e=>setNewTask({...newTask,priority:e.target.value})} style={sel}>
                      {PRIORITY.map(p=><option key={p}>{p}</option>)}
                    </select>
                    <select value={newTask.assignee} onChange={e=>setNewTask({...newTask,assignee:e.target.value})} style={sel}>
                      {STAFF.map(s=><option key={s}>{s}</option>)}
                    </select>
                    <select value={newTask.status} onChange={e=>setNewTask({...newTask,status:e.target.value})} style={sel}>
                      {["Open","In Progress","On Hold"].map(s=><option key={s}>{s}</option>)}
                    </select>
                    <input type="date" value={newTask.due} onChange={e=>setNewTask({...newTask,due:e.target.value})} style={sel} />
                    <input placeholder="Email ref (optional)" value={newTask.ref} onChange={e=>setNewTask({...newTask,ref:e.target.value})} style={sel} />
                    <textarea placeholder="Notes" value={newTask.notes} onChange={e=>setNewTask({...newTask,notes:e.target.value})}
                      style={{ gridColumn:"1/-1", ...sel, minHeight:55, resize:"vertical", fontSize:12 }} />
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:10 }}>
                    <button onClick={addTask} disabled={saving} style={{ background:"#c8a96e", color:"#1a1c18", border:"none", padding:"7px 18px", fontSize:11, cursor:"pointer", fontFamily:"inherit", textTransform:"uppercase", letterSpacing:1 }}>
                      {saving ? "Saving..." : "Add Task"}
                    </button>
                    <button onClick={()=>setShowAddTask(false)} style={{ background:"transparent", color:"#6a6e5e", border:"1px solid #3a3e30", padding:"7px 14px", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {filteredTasks.length===0 && <div style={{color:"#5a5e50",padding:20,textAlign:"center"}}>No tasks match these filters.</div>}
                {filteredTasks.map(t => (
                  <div key={t.id} onClick={()=>setSelectedTask(selectedTask?.id===t.id?null:t)}
                    style={{ background:selectedTask?.id===t.id?"#252720":"#22241e", border:`1px solid ${selectedTask?.id===t.id?"#c8a96e55":"#2e3028"}`, borderLeft:`4px solid ${SOURCES[t.source]?.color||"#888"}`, padding:"10px 14px", cursor:"pointer", display:"grid", gridTemplateColumns:"1fr auto", gap:8 }}
                    onMouseEnter={e=>{if(selectedTask?.id!==t.id)e.currentTarget.style.background="#252720"}} onMouseLeave={e=>{if(selectedTask?.id!==t.id)e.currentTarget.style.background="#22241e"}}>
                    <div>
                      <div style={{ fontSize:12, color:t.status==="Complete"?"#5a5e50":"#e8e0d0", marginBottom:3, textDecoration:t.status==="Complete"?"line-through":"none" }}>{t.title}</div>
                      <div style={{ display:"flex", gap:10, fontSize:10, color:"#5a5e50", flexWrap:"wrap" }}>
                        <span>{SOURCES[t.source]?.icon} {SOURCES[t.source]?.label}</span>
                        {t.assignee && <span>â†’ {t.assignee}</span>}
                        {t.category && t.category!=="General" && <span>ðŸ· {t.category}</span>}
                        {t.due && <span>ðŸ“… {t.due}</span>}
                        {t.ref && <span>ðŸ“§ {t.ref}</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                      <span style={{ fontSize:9, padding:"2px 7px", letterSpacing:1, background:statusColors[t.status]+"22", color:statusColors[t.status], border:`1px solid ${statusColors[t.status]}44`, textTransform:"uppercase" }}>{t.status}</span>
                      <span style={{ fontSize:9, padding:"2px 7px", color:t.priority==="High"?"#c0503a":t.priority==="Medium"?"#c8a96e":"#5a8a6a", textTransform:"uppercase", letterSpacing:1 }}>{t.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedTask && (
              <div style={{ background:"#22241e", border:"1px solid #2e3028", padding:20, alignSelf:"start", position:"sticky", top:62 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div style={{ fontSize:10, letterSpacing:2, color:SOURCES[selectedTask.source]?.color, textTransform:"uppercase" }}>{SOURCES[selectedTask.source]?.icon} {SOURCES[selectedTask.source]?.label}</div>
                  <button onClick={()=>setSelectedTask(null)} style={{ background:"transparent", border:"none", color:"#5a5e50", cursor:"pointer", fontSize:16 }}>âœ•</button>
                </div>
                <div style={{ fontSize:15, color:"#e8e0d0", marginBottom:14, lineHeight:1.5, fontFamily:"'Playfair Display',serif" }}>{selectedTask.title}</div>
                {selectedTask.notes && <div style={{ background:"#1a1c18", padding:10, marginBottom:14, fontSize:11, color:"#8a8e7a", lineHeight:1.6, borderLeft:"2px solid #3a3e30" }}>{selectedTask.notes}</div>}
                {selectedTask.ref && <div style={{ fontSize:10, color:"#4a7fa5", marginBottom:10 }}>ðŸ“§ {selectedTask.ref}</div>}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14, fontSize:10 }}>
                  {[["ASSIGNEE",selectedTask.assignee||"â€”"],["DUE DATE",selectedTask.due||"â€”"],["PRIORITY",selectedTask.priority],["CATEGORY",selectedTask.category||"â€”"],["ADDED",selectedTask.date_added||"â€”"]].map(([k,v])=>(
                    <div key={k} style={{color:"#5a5e50"}}>{k}<br/><span style={{color:"#c8d0b8",fontSize:12}}>{v}</span></div>
                  ))}
                </div>
                <div style={{ fontSize:10, color:"#5a5e50", marginBottom:7, letterSpacing:1, textTransform:"uppercase" }}>Update Status</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14 }}>
                  {["Open","In Progress","On Hold","Complete"].map(s=>(
                    <button key={s} onClick={()=>updateTaskStatus(selectedTask.id,s)} style={{ background:selectedTask.status===s?statusColors[s]+"33":"transparent", color:selectedTask.status===s?statusColors[s]:"#5a5e50", border:`1px solid ${selectedTask.status===s?statusColors[s]+"66":"#2e3028"}`, padding:"4px 9px", fontSize:10, cursor:"pointer", fontFamily:"inherit", textTransform:"uppercase", letterSpacing:1 }}>{s}</button>
                  ))}
                </div>
                <button onClick={()=>deleteTask(selectedTask.id)} style={{ background:"transparent", color:"#c0503a33", border:"1px solid #c0503a22", padding:"5px 12px", fontSize:10, cursor:"pointer", fontFamily:"inherit", textTransform:"uppercase", letterSpacing:1, width:"100%", transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.color="#c0503a";e.currentTarget.style.borderColor="#c0503a66"}} onMouseLeave={e=>{e.currentTarget.style.color="#c0503a33";e.currentTarget.style.borderColor="#c0503a22"}}>Delete Task</button>
              </div>
            )}
          </div>
        )}

        {/* ARABLE */}
        {!loading && view === "arable" && (
          <div>
            <div style={{ fontSize:10, letterSpacing:3, color:"#4a7fa5", marginBottom:18, textTransform:"uppercase" }}>ðŸŒ± Arable Rotation Calendar</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {ARABLE_MONTHS.map((m,i)=>(
                <div key={m.month} style={{ background:i===currentMonth?"#1e2a1e":"#22241e", border:`1px solid ${i===currentMonth?"#4a7fa5":"#2e3028"}`, borderTop:i===currentMonth?"3px solid #4a7fa5":"3px solid transparent", padding:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:15, color:i===currentMonth?"#4a7fa5":"#c8d0b8" }}>{m.month}</span>
                    {i===currentMonth && <span style={{ fontSize:9, color:"#4a7fa5", letterSpacing:2, textTransform:"uppercase" }}>Now</span>}
                  </div>
                  <div style={{ fontSize:10, color:"#5a6a5a", marginBottom:7 }}>{m.crops.join(" Â· ")}</div>
                  {m.tasks.map((task,j)=>(
                    <div key={j} style={{ fontSize:11, color:"#8a9080", padding:"3px 0", borderBottom:"1px solid #2a2c24", display:"flex", gap:5 }}>
                      <span style={{color:"#3a5a3a"}}>â–¸</span> {task}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMAIL GUIDE */}
        {!loading && view === "email" && (
          <div style={{ maxWidth:700 }}>
            <div style={{ fontSize:10, letterSpacing:3, color:"#c8a96e", marginBottom:18, textTransform:"uppercase" }}>ðŸ“§ Email Filing System Guide</div>
            {[
              { title:"Recommended Folder Structure", color:"#c8a96e", items:[
                {label:"INBOX â€” Active/Unread",desc:"Open jobs only. If it's in your inbox, it needs action."},
                {label:"01_ARABLE",desc:"Advisor recs, Omnia outputs, spray/fert records, Steve correspondence"},
                {label:"02_CATTLE",desc:"Vet, feed, silage contractors, movement records"},
                {label:"03_SHEEP",desc:"Vet, feed, movement records, shearing"},
                {label:"04_PIGS",desc:"Pig Hub, Harbro, Deerpark, slurry contractors, milling"},
                {label:"05_HORSES",desc:"Vet, farrier, feed, paddock â€” from owner's wife"},
                {label:"06_FARM_GENERAL",desc:"Maintenance, tracks, machinery, fencing across all units"},
                {label:"07_CHAPEL_FARM",desc:"James â€” via PA/CEO, property projects, capital works"},
                {label:"08_COW_CLOSE",desc:"Owner's residence tasks and instructions"},
                {label:"09_PROPERTY",desc:"Rental properties, staff housing, estate maintenance"},
                {label:"10_FINANCE_ORDERS",desc:"Purchase orders, invoices, delivery notes"},
                {label:"_ARCHIVE/Year",desc:"Completed jobs â€” move annually"},
              ]},
              { title:"Reference Numbering", color:"#4a7fa5", items:[
                {label:"Format: EMAIL-YYYY-NNN",desc:"e.g. EMAIL-2026-051"},
                {label:"Add ref to task",desc:"Log in the Email Ref field when creating a task from an email"},
                {label:"Subject prefix",desc:"[EMAIL-2026-051] Cottage roof repair"},
              ]},
              { title:"Rules to Set Up", color:"#5a8a6a", items:[
                {label:"Owner's wife",desc:"Filter her address â†’ auto-label HORSES"},
                {label:"James's PA/CEO",desc:"Filter their domain â†’ auto-label CHAPEL_FARM"},
                {label:"Omnia / advisor",desc:"Filter Omnia sender â†’ auto-move to 01_ARABLE"},
                {label:"Harbro / Deerpark",desc:"Filter â†’ auto-label PIGS"},
                {label:"Unread = open job",desc:"Only mark read once task is logged"},
              ]},
              { title:"Morning Meeting Protocol", color:"#9e7bb5", items:[
                {label:"Verbal tasks",desc:"Log before leaving the yard after each morning meeting"},
                {label:"WhatsApp overnight",desc:"Check before meeting â€” log horse/owner messages"},
                {label:"Friday review",desc:"Chase overdue, archive completed"},
              ]},
            ].map(section=>(
              <div key={section.title} style={{ background:"#22241e", border:"1px solid #2e3028", borderLeft:`4px solid ${section.color}`, padding:18, marginBottom:12 }}>
                <div style={{ fontSize:10, letterSpacing:2, color:section.color, marginBottom:12, textTransform:"uppercase" }}>{section.title}</div>
                {section.items.map((item,i)=>(
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:10, padding:"7px 0", borderBottom:"1px solid #2a2c24" }}>
                    <span style={{ fontSize:11, color:"#c8d0b8" }}>{item.label}</span>
                    <span style={{ fontSize:11, color:"#6a7060", lineHeight:1.5 }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
