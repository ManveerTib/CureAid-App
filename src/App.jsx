import React, { useState, useRef, useEffect, useLayoutEffect, useSyncExternalStore, useId } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, ArrowRight, Home as HomeIcon, Search as SearchIcon, Users, FlaskConical, GraduationCap, Info, LayoutDashboard, Ellipsis, LogIn, LogOut, UserPlus, X, Phone, ExternalLink, ChevronDown, ChevronRight, Check, CreditCard, Sparkles, ShieldAlert, Copy, Headset, Gauge, Calculator, FileText, Pill, Stethoscope, Ribbon, Brain, Dna, Hand, Bone, Wind, HeartPulse, Droplet, Salad, CircleCheck, Heart, MessageCircle, MessagesSquare, Share2, ShieldCheck } from "lucide-react";
import { PSP_DATABASE } from "./pspDatabase";
import { AI_ENABLED, aiSearch, aiMatch, aiTranslate, aiAppealLetter, aiBriefing, aiCoachAnswer, aiDangerCheck } from "./api";


// Counts shown in the UI are computed from the bundled database, not hardcoded.
const DB_STATS = {
  programs: PSP_DATABASE.length,
  manufacturers: new Set(PSP_DATABASE.flatMap(p => p.manufacturer.split(/\s*[/(]\s*/)[0])).size,
  conditions: new Set(PSP_DATABASE.flatMap(p => p.conditions.map(c => c.toLowerCase()))).size,
};


const COMMUNITY_POSTS = [
  { id:1, author:"Sarah K.", condition:"Atopic Dermatitis", avatar:"SK", time:"2 days ago", content:"Just got approved for Dupixent MyWay! The process was surprisingly easy – called the number on CureAid, had my insurance card and income info ready, and was approved in 2 days. $0/month now instead of $800. If you're hesitating, just call!", likes:42, replies:8, tag:"Success Story" },
  { id:2, author:"Marcus T.", condition:"Multiple Sclerosis", avatar:"MT", time:"3 days ago", content:"Has anyone had issues with the Biogen Support Solutions program taking longer than expected? I submitted my application 2 weeks ago and still haven't heard back. My neurologist confirmed everything was sent correctly.", likes:14, replies:12, tag:"Question" },
  { id:3, author:"Linda P.", condition:"Rheumatoid Arthritis", avatar:"LP", time:"5 days ago", content:"Tip for everyone applying to myAbbVie Assist: when they ask about income, make sure you report HOUSEHOLD income (all people in your home), not just yours. I almost made that mistake. Also – call don't email. Much faster.", likes:67, replies:5, tag:"Tips" },
  { id:4, author:"David W.", condition:"Crohn's Disease", avatar:"DW", time:"1 week ago", content:"My insurance denied Stelara twice. Used the appeal generator on here both times. Second letter worked – approved this morning. The AI letter was incredibly detailed and mentioned the specific clinical guidelines by name. Highly recommend.", likes:89, replies:14, tag:"Success Story" },
  { id:5, author:"Aisha M.", condition:"Oncology", avatar:"AM", time:"1 week ago", content:"Quick question – if I'm on Medicare for my primary and have a secondary commercial plan, does the copay card work with the secondary? My oncologist's office wasn't sure.", likes:9, replies:7, tag:"Question" },
  { id:6, author:"Tom H.", condition:"Heart Failure", avatar:"TH", time:"2 weeks ago", content:"Entresto was $400/month for me until I found this site. Enrolled in the Novartis savings card in 10 minutes. Now $10/month. Wish I had found this 6 months ago. Thank you CureAid.", likes:122, replies:3, tag:"Success Story" },
];

const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--navy:#091D2E;--teal:#1D9E75;--teal-d:#13805E;--teal-t:#DCEFE8;--teal-ink:#0F6E50;--sage:#8daba8;--blue:#185FA5;--sky:#EEF5F4;--off:#F4F7F6;--paper:#F6F9F8;--text:#2D3748;--muted:#5B6B78;--border:#D1DDD9;--rose:#B42318;--rose-bg:#FEF3F2;--rose-bd:#FECDCA;--sh:0 1px 4px rgba(9,29,46,.07);--sh2:0 4px 18px rgba(9,29,46,.11);--nav-h:56px;--tab-h:64px;}
  body{font-family:'Outfit',sans-serif;color:var(--text);background:#fff;font-size:14px}
  h1,h2,h3,h4{font-family:'Instrument Serif',serif;font-weight:400}
  p,label,input,select,button,textarea{font-family:'Outfit',sans-serif}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .fu{}
  .page{min-height:calc(100vh - 60px)}
  .nav{height:56px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;gap:16px;position:sticky;top:0;z-index:100;box-shadow:var(--sh)}
  .nav-logo{cursor:pointer;flex-shrink:0}
  .nav-links{display:flex;gap:2px;flex:1;overflow-x:auto}
  .nav-r{display:flex;align-items:center;gap:8px;flex-shrink:0}
  .nb{background:none;border:none;padding:6px 11px;border-radius:6px;cursor:pointer;font-size:13px;color:var(--muted);font-family:'Outfit',sans-serif;font-weight:500;transition:background-color .15s,color .15s,border-color .15s;white-space:nowrap}.nb.on{background:var(--sky);color:var(--navy)}@media(hover:hover){.nb:hover{background:var(--sky);color:var(--navy)}}
  .btn{border-radius:8px;padding:8px 18px;font-size:13.5px;font-weight:600;cursor:pointer;transition:background-color .15s,color .15s,border-color .15s;font-family:'Outfit',sans-serif;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1.5px solid transparent}
  .btn:disabled{opacity:.5;cursor:not-allowed}
  .bp{background:var(--teal-d);color:#fff;border-color:var(--teal-d)}@media(hover:hover){.bp:hover:not(:disabled){background:#0f6e50;border-color:#0f6e50}}
  .bg{background:var(--sky);color:var(--navy);border-color:var(--border)}@media(hover:hover){.bg:hover:not(:disabled){background:#e0ece9}}
  .bo{background:#fff;color:var(--navy);border-color:var(--border)}@media(hover:hover){.bo:hover:not(:disabled){background:var(--sky)}}
  .bw{background:#fff;color:var(--navy)}@media(hover:hover){.bw:hover:not(:disabled){background:rgba(255,255,255,.9)}}
  .blg{padding:12px 26px;font-size:15px}
  .bsm{padding:5px 12px;font-size:12px}
  .inp{width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13.5px;color:var(--navy);background:#fff;transition:border-color .15s;font-family:'Outfit',sans-serif}
  .inp:focus{border-color:var(--teal)}
  .lbl{font-size:12px;font-weight:600;color:var(--text);display:block;margin-bottom:4px}
  .fg{display:flex;flex-direction:column;gap:4px}
  .card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:18px 20px;box-shadow:var(--sh);transition:box-shadow .2s}@media(hover:hover){.card:hover{box-shadow:var(--sh2)}}
  .psp-card{background:#fff;border:1px solid var(--border);border-radius:16px;box-shadow:var(--sh);overflow:hidden;transition:box-shadow .2s}@media(hover:hover){.psp-card:hover{box-shadow:var(--sh2)}}
  .psp-top{padding:18px 20px 0}
  .psp-meta{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}
  .psp-tier{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;border:1px solid}
  .tier4{background:var(--sky);color:var(--teal-ink);border-color:#b8d0ce}
  .tier5{background:var(--rose-bg);color:var(--rose);border-color:var(--rose-bd)}
  .psp-spec{font-size:12.5px;color:var(--muted);font-weight:500}
  .psp-drug{font-family:'Instrument Serif',serif;font-size:27px;line-height:1.08;color:var(--navy);text-wrap:balance}
  .psp-sub{font-size:14px;color:var(--muted);margin-top:5px;line-height:1.45}
  .psp-sub b{color:var(--text);font-weight:600}
  .psp-why{margin:12px 20px 0;font-size:14px;color:var(--text);line-height:1.55}
  .psp-price{margin:16px 20px 0;padding:14px 16px;border-radius:12px;background:var(--sky);border:1px solid #D7E6E2}
  .psp-price-k{font-size:13px;color:var(--muted);font-weight:500}
  .psp-price-v{font-family:'Instrument Serif',serif;font-size:34px;line-height:1.05;color:var(--teal-d);margin-top:2px}
  .psp-price-n{font-size:14px;color:var(--text);line-height:1.55;margin-top:6px}
  .psp-conditions{padding:14px 20px 0;display:flex;gap:6px;flex-wrap:wrap}
  .psp-cond{font-size:12.5px;background:#fff;color:var(--navy);border:1px solid var(--border);border-radius:999px;padding:3px 10px;font-weight:500}
  .psp-body{padding:16px 20px 4px}
  .psp-section{margin-bottom:18px}
  .psp-section-title{font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;color:var(--navy);margin-bottom:8px}
  .psp-sec-row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px}
  .psp-cost{font-size:13px;color:var(--text);line-height:1.6;background:var(--sky);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-weight:500}
  .psp-step{display:flex;gap:12px;margin-bottom:10px;align-items:flex-start}
  .psp-step-num{width:24px;height:24px;min-width:24px;border-radius:50%;background:var(--navy);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center}
  .psp-step p,.psp-bullet p{font-size:14px;color:var(--text);line-height:1.6}
  .psp-bullet{display:flex;gap:10px;margin-bottom:8px;align-items:flex-start}
  .psp-bullet svg{color:var(--teal);flex-shrink:0;margin-top:3px}
  .psp-elig{font-size:14px;color:var(--text);line-height:1.65}
  .psp-contact{background:var(--sky);border:1px solid var(--border);border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:12px}
  .psp-phone{font-size:16px;font-weight:600;color:var(--navy)}
  .psp-hours{font-size:13px;color:var(--muted)}
  .link-btn{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:var(--teal-ink);background:#fff;border:1px solid var(--border);border-radius:999px;padding:5px 11px;cursor:pointer;font-family:'Outfit',sans-serif;min-height:32px}@media(hover:hover){.link-btn:hover{background:var(--sky)}}
  .faq-item{border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:8px}
  .faq-q{width:100%;padding:12px 14px;background:#fff;border:none;cursor:pointer;font-size:14px;font-weight:600;color:var(--navy);text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px;font-family:'Outfit',sans-serif;min-height:48px}@media(hover:hover){.faq-q:hover{background:var(--paper)}}
  .faq-chevron{transition:transform .2s;color:var(--muted);flex-shrink:0}
  .faq-chevron.open{transform:rotate(180deg)}
  .faq-a{padding:0 14px 12px;font-size:14px;color:var(--text);line-height:1.65;background:#fff}
  .psp-actions{padding:6px 20px 18px;display:flex;flex-wrap:wrap;gap:8px}
  .psp-actions .btn{flex:1 1 0;min-width:0;min-height:44px;font-size:14px;padding-left:10px;padding-right:10px;white-space:nowrap}
  .psp-actions .psp-enroll{flex-basis:100%;min-height:48px;font-size:15px}
  .psp-deny{flex-basis:100%;background:none;border:none;color:var(--rose);font:600 14px 'Outfit',sans-serif;min-height:40px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:8px}@media(hover:hover){.psp-deny:hover{background:var(--rose-bg)}}
  .psp-appeal{padding:16px 20px 18px;border-top:1px solid var(--rose-bd);background:#FFFBFA}
  .score{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:3px 12px 3px 3px;font-size:13px;font-weight:600;border:1px solid}
  .score-n{font-size:12px;font-weight:700}
  .hero{background:linear-gradient(160deg,var(--navy) 0%,#0e2d46 60%,#1a4a3c 100%);padding:80px 32px;text-align:center;min-height:420px;display:flex;align-items:center}
  .hero-in{max-width:680px;margin:0 auto}
  .hero h1{font-size:clamp(28px,5vw,52px);color:#fff;margin-bottom:8px;line-height:1.1}
  .hero h1 em{color:#8daba8;font-style:italic}
  .sbar{background:var(--navy);padding:20px 32px;display:flex;justify-content:center;border-bottom:1px solid rgba(255,255,255,.1)}
  .sstat{text-align:center;padding:0 28px;border-right:1px solid rgba(255,255,255,.1)}
  .sstat:last-child{border-right:none}
  .sn{font-family:'Instrument Serif',serif;font-size:26px;color:#8daba8;line-height:1}
  .sl{font-size:12px;color:rgba(255,255,255,.5);margin-top:3px;font-weight:500}
  .sec{padding:64px 32px}
  .secsm{padding:28px 32px}
  .ws{max-width:720px;margin:0 auto}
  .w{max-width:1120px;margin:0 auto}
  .tc{text-align:center}
  .fc{display:flex;align-items:center}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
  .g4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px}
  @media(max-width:700px){.g2,.g3,.g4{grid-template-columns:1fr}.nav-links{display:none}.sbar{flex-wrap:wrap}}
  .badge{font-size:12px;font-weight:600;padding:3px 9px;border-radius:6px;border:1px solid}
  .bb{background:rgba(141,171,168,.15);color:#8daba8;border-color:rgba(141,171,168,.3)}
  .bt{background:rgba(24,95,165,.15);color:#185FA5;border-color:rgba(24,95,165,.3)}
  .chip{background:#fff;border:1.5px solid var(--border);border-radius:20px;padding:5px 14px;font-size:13px;color:var(--muted);cursor:pointer;transition:background-color .15s,color .15s,border-color .15s;font-family:'Outfit',sans-serif;font-weight:500}
  .chip.on{background:var(--teal-d);color:#fff;border-color:var(--teal-d)}
  @media(hover:hover){.chip:hover{background:var(--teal-d);color:#fff;border-color:var(--teal-d)}}
  .dots{display:inline-flex;gap:5px;align-items:center}
  .dots span{width:7px;height:7px;border-radius:50%;background:var(--teal);animation:dotBounce 1.1s infinite ease-in-out}
  .dots span:nth-child(2){animation-delay:.18s}
  .dots span:nth-child(3){animation-delay:.36s}
  @keyframes dotBounce{0%,80%,100%{transform:scale(.7);opacity:.5}40%{transform:scale(1);opacity:1}}
  .footer{background:var(--navy);padding:44px 32px 24px;color:rgba(255,255,255,.5);font-size:13px}
  .fgrid{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px}
  @media(max-width:700px){.fgrid{grid-template-columns:1fr 1fr}}
  .fbrand{color:rgba(255,255,255,.45)}
  .fcol h4{color:rgba(255,255,255,.85);font-size:13px;font-weight:700;font-family:'Outfit',sans-serif;margin-bottom:12px;text-transform:uppercase;letter-spacing:.05em}
  .flink{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.45);font-size:13px;display:block;padding:4px 0;text-align:left;font-family:'Outfit',sans-serif;transition:color .15s}@media(hover:hover){.flink:hover{color:#8daba8}}
  .authpg{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--off);padding:32px 16px}
  .authcard{background:#fff;border-radius:16px;padding:40px 36px;width:100%;max-width:420px;box-shadow:0 4px 32px rgba(9,29,46,.08)}
  .adiv{text-align:center;font-size:12px;color:var(--muted);position:relative;margin:8px 0}
  .adiv::before,.adiv::after{content:'';position:absolute;top:50%;width:45%;height:1px;background:var(--border)}
  .adiv::before{left:0}.adiv::after{right:0}
  .av{width:32px;height:32px;border-radius:50%;background:var(--teal-t);display:flex;align-items:center;justify-content:center;color:var(--teal-ink);font-size:12px;font-weight:700;flex-shrink:0}
  .pav2{width:36px;height:36px;border-radius:50%;background:var(--teal-t);display:flex;align-items:center;justify-content:center;color:var(--teal-ink);font-size:13px;font-weight:700;flex-shrink:0}
  .dg{display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:start}
  @media(max-width:700px){.dg{grid-template-columns:1fr}}
  .snav-wrap{background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden}
  .sn2{width:100%;background:none;border:none;border-bottom:1px solid var(--border);padding:12px 16px;text-align:left;font-family:'Outfit',sans-serif;font-size:13.5px;font-weight:500;color:var(--muted);cursor:pointer;transition:background-color .15s,color .15s,border-color .15s}
  .sn2:last-child{border-bottom:none}.sn2.on{background:var(--sky);color:var(--navy)}@media(hover:hover){.sn2:hover{background:var(--sky);color:var(--navy)}}
  .met{background:#fff;border:1px solid var(--border);border-radius:10px;padding:16px;text-align:center;box-shadow:var(--sh)}
  .met-n{font-family:'Instrument Serif',serif;font-size:28px;color:var(--teal);line-height:1;margin-bottom:4px}
  .met-l{font-size:12px;color:var(--muted)}
  .ahero{background:var(--navy);padding:80px 32px;text-align:center}
  .ahero h1{font-size:clamp(24px,4vw,44px);color:#fff;max-width:680px;margin:0 auto;line-height:1.2}
  .ahero h1 em{color:inherit;font-style:normal}
  .ahero p{color:rgba(255,255,255,.6);font-size:15px;max-width:560px;margin:12px auto 0;line-height:1.8}
  .tbar{background:#fff;border-bottom:1px solid var(--border);padding:0 32px}
  .tbar-in{max-width:720px;margin:0 auto;display:flex}
  .tab{padding:12px 20px;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-size:14px;font-weight:500;color:var(--muted);font-family:'Outfit',sans-serif;margin-bottom:-1px;transition:background-color .15s,color .15s,border-color .15s}
  .tab.on{border-bottom-color:var(--teal);color:var(--navy)}
  .gci{display:flex;gap:10px;margin-bottom:10px;align-items:flex-start}
  .gck{width:20px;height:20px;min-width:20px;background:var(--teal);border-radius:50%;color:#fff;font-size:12px;display:flex;align-items:center;justify-content:center;margin-top:2px}
  .post{background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px 18px;box-shadow:var(--sh);transition:box-shadow .2s}@media(hover:hover){.post:hover{box-shadow:var(--sh2)}}
  .pact{background:none;border:none;cursor:pointer;font-size:12px;color:var(--muted);font-family:'Outfit',sans-serif;padding:3px 8px;border-radius:5px;transition:background-color .15s,color .15s,border-color .15s}@media(hover:hover){.pact:hover{background:var(--sky);color:var(--navy)}}
  :focus-visible{outline:2px solid var(--teal);outline-offset:2px}
  @keyframes pgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .pg-anim{animation:pgIn .28s ease-out both}
  .btn{transition:background-color .15s,border-color .15s,box-shadow .15s,scale .15s ease-out}
  .btn:not(:disabled):active,.chip:not(:disabled):active,.tap:not(:disabled):active{scale:.96}
  .chip,.tap{transition:background-color .15s,color .15s,border-color .15s,scale .15s ease-out}
  select.inp{appearance:none;-webkit-appearance:none;padding-right:38px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235B6B78' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}
  .inp:focus{outline:2px solid transparent;box-shadow:0 0 0 3px rgba(29,158,117,.25)}
  .lbl{font-size:13px}
  .hint{font-size:12.5px;color:var(--muted);margin-top:2px}

  /* Search field (hero + search page) */
  .sfield{position:relative;flex:1;min-width:0}
  .sfield > svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
  .sfield input{width:100%;height:50px;border:1.5px solid var(--border);border-radius:12px;padding:0 44px 0 44px;font:500 16px 'Outfit',sans-serif;color:var(--navy);background:#fff;-webkit-appearance:none;appearance:none}
  .sfield input::-webkit-search-cancel-button{display:none}
  .sfield input:focus{outline:2px solid transparent;border-color:var(--teal);box-shadow:0 0 0 3px rgba(29,158,117,.15)}
  .sfield-x{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:38px;height:38px;border:none;background:none;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--muted);cursor:pointer}@media(hover:hover){.sfield-x:hover{background:var(--sky)}}
  .sform{display:flex;gap:8px}
  .sform .btn{min-height:50px;padding:0 22px;font-size:15px;border-radius:12px}
  .hero-search{max-width:560px}
  .hero-search .sfield input{border-color:transparent}
  .hero-quick{display:flex;gap:8px;justify-content:flex-start;flex-wrap:wrap;margin-top:14px}
  .hero-quick button{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);color:rgba(255,255,255,.82);border-radius:999px;padding:7px 14px;font:500 13.5px 'Outfit',sans-serif;cursor:pointer;min-height:36px}@media(hover:hover){.hero-quick button:hover{background:rgba(255,255,255,.12)}}

  /* Segmented control on dark headers */
  .seg{display:flex;gap:4px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:4px;max-width:420px}
  .seg button{flex:1;min-height:40px;border:none;border-radius:9px;background:none;color:rgba(255,255,255,.72);font:600 14px 'Outfit',sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;transition:background .15s,color .15s}
  .seg button.on{background:#fff;color:var(--navy);box-shadow:0 1px 3px rgba(0,0,0,.2)}
  .pghead{background:var(--navy);padding:36px 32px 22px}
  .pghead h1{font-family:'Instrument Serif',serif;font-size:clamp(30px,4vw,42px);color:#fff;line-height:1.1;margin-bottom:6px}
  .pghead p{color:rgba(255,255,255,.66);font-size:15px;line-height:1.6;margin-bottom:18px;max-width:560px}

  /* Results */
  .res-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:4px 0 12px}
  .res-head h2{font-family:'Outfit',sans-serif;font-size:15px;font-weight:600;color:var(--navy)}
  .res-head span{font-size:13px;color:var(--muted)}
  .ai-note{font-size:14px;color:var(--muted);line-height:1.55;margin:0 0 10px;text-wrap:pretty}
  .ai-note svg{color:var(--teal);flex-shrink:0;margin-top:2px}
  @keyframes shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
  .skel{background:linear-gradient(90deg,#edf2f1 25%,#f7faf9 50%,#edf2f1 75%);background-size:200% 100%;animation:shimmer 1.3s linear infinite;border-radius:8px}
  .form-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:18px;box-shadow:var(--sh)}

  /* Quick actions (mobile home) */
  .qa{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .qa button{display:flex;flex-direction:column;align-items:flex-start;gap:10px;text-align:start;background:#fff;border:1px solid var(--border);border-radius:16px;padding:14px;min-height:118px;cursor:pointer;box-shadow:var(--sh);font-family:'Outfit',sans-serif;-webkit-tap-highlight-color:transparent}
  .qa .qa-ic{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:var(--teal-t);color:var(--teal-ink)}
  .qa b{font-size:15px;font-weight:600;color:var(--navy);display:block;line-height:1.25}
  .qa small{font-size:12.5px;color:var(--muted);line-height:1.4;display:block;margin-top:2px}

  /* Mobile tab bar + More sheet */
  .mtab,.msheet,.msheet-bg{display:none}
  @media(min-width:701px){.show-m{display:none !important}}
  @media(max-width:700px){
    body{font-size:16px;background:var(--paper)}
    .nav{height:calc(var(--nav-h) + env(safe-area-inset-top));padding:env(safe-area-inset-top) 16px 0;gap:10px;background:var(--navy);border-bottom:1px solid rgba(255,255,255,.08);box-shadow:none}
    .nav-r .btn.bg{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2);min-height:38px}
    .nav-acct{width:38px;height:38px;border-radius:50%;border:none;padding:0;cursor:pointer}
    .nav-links{display:none !important}
    .hide-m{display:none !important}
    .app-shell{padding-bottom:calc(var(--tab-h) + env(safe-area-inset-bottom))}
    .mtab{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;z-index:300;background:rgba(255,255,255,.95);-webkit-backdrop-filter:saturate(1.6) blur(16px);backdrop-filter:saturate(1.6) blur(16px);border-top:1px solid var(--border);padding:0 4px env(safe-area-inset-bottom)}
    .mtab button{min-height:var(--tab-h);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:none;cursor:pointer;color:var(--muted);font:600 12px 'Outfit',sans-serif;padding:0}
    .mtab .ic{width:56px;height:30px;border-radius:999px;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s}
    .mtab button.on{color:var(--navy)}
    .mtab button.on .ic{background:var(--teal-t);color:var(--teal-ink)}
    .mtab button:active .ic{background:var(--sky)}
    .msheet-bg{display:block;position:fixed;inset:0;z-index:310;background:rgba(9,29,46,.5);animation:fadeIn .2s ease both}
    .msheet{display:block;position:fixed;left:0;right:0;bottom:0;z-index:320;background:#fff;border-radius:22px 22px 0 0;padding:8px 12px calc(14px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(9,29,46,.2);animation:sheetUp .28s cubic-bezier(.2,.8,.2,1) both}
    .msheet-grab{width:40px;height:5px;border-radius:3px;background:#D5DEDB;margin:2px auto 8px}
    .msheet-head{display:flex;align-items:center;justify-content:space-between;padding:4px 8px 8px}
    .msheet-head h2{font-family:'Instrument Serif',serif;font-size:24px;color:var(--navy)}
    .msheet-x{width:40px;height:40px;border-radius:50%;border:none;background:var(--sky);color:var(--navy);display:flex;align-items:center;justify-content:center;cursor:pointer}
    .msheet-item{width:100%;display:flex;align-items:center;gap:14px;min-height:56px;padding:0 10px;border:none;background:none;border-radius:14px;font-family:'Outfit',sans-serif;text-align:left;cursor:pointer;color:var(--navy)}
    .msheet-item .ic{width:38px;height:38px;border-radius:11px;background:var(--sky);display:flex;align-items:center;justify-content:center;color:var(--teal-ink);flex-shrink:0}
    .msheet-item b{display:block;font-size:16px;font-weight:600}
    .msheet-item small{display:block;font-size:13px;color:var(--muted)}
    .msheet-item:active,.msheet-item.on{background:var(--sky)}
    .msheet-sep{height:1px;background:var(--border);margin:6px 10px}
    .msheet-item.danger{color:var(--rose)}
    .msheet-item.danger .ic{background:var(--rose-bg);color:var(--rose)}

    .inp{font-size:16px;min-height:48px;padding:11px 13px;border-radius:10px}
    textarea.inp{min-height:auto}
    .btn{min-height:46px;font-size:15px}
    .bsm{min-height:42px;padding:8px 14px;font-size:14px}
    .blg{min-height:52px;width:100%}
    .chip{min-height:40px;padding:8px 16px;font-size:14px}
    .pact{min-height:40px;padding:6px 10px;font-size:13.5px}
    .m-stack{grid-template-columns:minmax(0,1fr) !important}
    .m-2col{grid-template-columns:1fr 1fr !important}
    .m-3col{grid-template-columns:repeat(3,1fr) !important}
    .m-col{flex-direction:column !important;align-items:stretch !important}
    .m-px{padding-left:16px !important;padding-right:16px !important}
    .m-py{padding-top:40px !important;padding-bottom:40px !important}
    .m-months{grid-template-columns:repeat(6,1fr) !important}
    .m-full{width:100% !important}
    .m-scroll-x{overflow-x:auto;flex-wrap:nowrap !important;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin-left:-16px;margin-right:-16px;padding-left:16px;padding-right:16px}
    .m-scroll-x::-webkit-scrollbar{display:none}
    .m-scroll-x > *{flex-shrink:0}
    .sec{padding:44px 16px}
    .secsm{padding:20px 16px}
    .card{padding:16px}
    .sbar{display:grid !important;grid-template-columns:1fr 1fr;gap:18px 0;padding:22px 16px}
    .sstat{border-right:none;padding:0 8px}
    .sstat:nth-child(odd){border-right:1px solid rgba(255,255,255,.1)}
    .sn{font-size:30px}
    .sl{font-size:12px}
    .pghead{padding:22px 16px 16px}
    .pghead p{font-size:15px;margin-bottom:16px}
    .seg{max-width:none}
    .s-sticky{position:sticky;top:calc(var(--nav-h) + env(safe-area-inset-top));z-index:50;background:var(--paper);margin:0 -16px;padding:12px 16px 10px;border-bottom:1px solid transparent}
    .sform .btn{padding:0 16px}
    .psp-top{padding:16px 16px 0}
    .psp-drug{font-size:26px}
    .psp-price,.psp-why{margin-left:16px;margin-right:16px}
    .psp-conditions,.psp-body{padding-left:16px;padding-right:16px}
    .psp-actions{padding:6px 16px 16px}
    .psp-appeal{padding:16px}
    .hero-geo{min-height:0 !important}
    .hero-content{padding:44px 16px 40px !important}
    .hero-lockup img{width:52px !important;height:52px !important}
    .hero-lockup span{font-size:54px !important}
    .ahero{padding:44px 20px}
    .tbar{padding:0 16px}
    .tab{flex:1;min-height:48px}
    .footer-grid{grid-template-columns:1fr !important;gap:28px !important}
    .footer-in{padding:36px 20px 24px !important}
    .auth-wrap{padding:16px 12px 24px !important;align-items:flex-start !important;min-height:0 !important}
    .auth-card{min-height:0 !important;border-radius:20px !important}
    .auth-form{padding:28px 20px 24px !important}
    .auth-inp{font-size:16px !important;min-height:50px}
    .m-tight{padding:18px 16px !important}
    .sim-inp{font-size:16px !important;min-height:48px}
    .coach-steps{gap:6px !important}
    .coach-steps .lbl-step{display:none}
    .coach-steps .on .lbl-step{display:inline}
  }
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes sheetUp{from{transform:translateY(100%)}to{transform:none}}
  @media(prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}
  }

  /* ── Phone pass: program list, detail sheet, suggestions, pills ── */
  .plist{display:flex;flex-direction:column;gap:14px}
  .pgroup{background:#fff;border:1px solid var(--border);border-radius:18px;overflow:hidden}
  .pgroup > div + div .prow{border-top:1px solid #E3EBE8}
  .prow{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:14px;row-gap:12px;width:100%;text-align:start;background:#fff;border:none;padding:16px 14px 14px 16px;cursor:pointer;font-family:'Outfit',sans-serif;color:var(--text);-webkit-tap-highlight-color:transparent;transition:background-color .15s}
  .prow:active{background:var(--sky)}
  .prow-id{display:flex;flex-direction:column;gap:5px;min-width:0}
  .prow-name{font-family:'Instrument Serif',serif;font-size:1.625rem;line-height:1.05;color:var(--navy);letter-spacing:-.01em;overflow-wrap:break-word}
  .prow-prog{font-size:.875rem;color:var(--muted);line-height:1.4}
  .prow-prog b{color:var(--text);font-weight:600}
  .prow-price{display:flex;flex-direction:column;align-items:flex-end;text-align:end;white-space:nowrap;font-variant-numeric:tabular-nums;padding-top:1px}
  .prow-price small{font-size:.75rem;color:var(--muted);font-weight:500;line-height:1.3;margin-bottom:2px}
  .prow-price b{font-family:'Instrument Serif',serif;font-weight:400;font-size:2.25rem;line-height:.95;color:var(--teal-d);letter-spacing:-.01em}
  .prow-price b.prow-price-sm{font-family:'Outfit',sans-serif;font-size:.9375rem;font-weight:600;line-height:1.4;letter-spacing:0}
  .prow-price i{font-style:normal;font-size:.8125rem;color:var(--muted);margin-top:3px}
  .prow-foot{grid-column:1 / -1;display:flex;align-items:center;gap:10px;min-width:0;font-size:.8125rem;color:var(--muted)}
  .ptier{display:inline-flex;align-items:center;gap:6px;font-weight:600;color:var(--teal-ink);white-space:nowrap;flex-shrink:0}
  .ptier::before{content:'';width:8px;height:8px;border-radius:50%;background:currentColor}
  .ptier5{color:var(--rose)}
  .prow-score{display:inline-flex;align-items:center;gap:5px;font-weight:600;white-space:nowrap;flex-shrink:0;font-variant-numeric:tabular-nums}
  .prow-score svg{width:18px;height:18px}
  .prow-cond{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .prow-go{color:#7C8C97;flex-shrink:0;margin-inline-start:auto}

  .psheet-bg{position:fixed;inset:0;z-index:400;background:rgba(9,29,46,.55);animation:fadeIn .25s ease-out backwards}
  .psheet-bg.out{animation:fadeOut .2s ease-in forwards}
  .psheet{position:fixed;left:0;right:0;bottom:0;z-index:410;height:calc(100dvh - env(safe-area-inset-top) - 24px);max-width:640px;margin:0 auto;background:#fff;border-radius:24px 24px 0 0;display:flex;flex-direction:column;box-shadow:0 -1px 0 rgba(9,29,46,.06),0 -12px 40px rgba(9,29,46,.22);animation:sheetUp .34s cubic-bezier(.2,0,0,1) backwards;transition:transform .25s cubic-bezier(.2,0,0,1)}
  .psheet.out{animation:sheetDown .2s cubic-bezier(.3,0,1,1) forwards}
  .psheet-bar{position:relative;flex-shrink:0;height:56px;display:flex;align-items:center;justify-content:flex-end;padding:0 10px;touch-action:none}
  .psheet-grab{position:absolute;left:50%;top:8px;translate:-50% 0;width:40px;height:5px;border-radius:3px;background:#C9D5D1}
  .psheet-x{width:44px;height:44px;border-radius:50%;border:none;background:var(--sky);color:var(--navy);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:scale .15s ease-out}
  .psheet-x:active{scale:.96}
  .psheet-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scroll-padding-block-end:96px}
  @keyframes sheetDown{to{transform:translateY(100%)}}
  @keyframes fadeOut{to{opacity:0}}
  @keyframes psFade{from{opacity:0}}
  @media(prefers-reduced-motion:reduce){
    .psheet,.psheet-bg{animation:psFade .2s ease-out backwards !important;transition:none !important}
    .psheet.out,.psheet-bg.out{animation:fadeOut .15s ease-in forwards !important}
  }

  .psp-card.in-sheet{border:none;border-radius:0;box-shadow:none;overflow:visible}
  .in-sheet .psp-top{padding:0 16px}
  .in-sheet .psp-drug{font-size:2.25rem;line-height:1.05;letter-spacing:-.01em}
  .in-sheet .psp-price{padding:16px 18px;border-radius:16px}
  .in-sheet .psp-price-v{font-size:3.25rem}
  .psp-price-v{font-variant-numeric:tabular-nums}
  .psp-price-u{font-size:18px;color:var(--muted);margin-inline-start:2px}
  .psp-links{display:flex;flex-wrap:wrap;gap:8px;padding:14px 16px 0}
  .psp-links .link-btn{min-height:40px;padding:0 14px;font-size:14px}
  .psp-steps{list-style:none;padding:0;margin:0}
  .psp-deny-wrap{padding:0 16px 10px}
  .psp-dock{position:sticky;bottom:0;z-index:2;display:flex;gap:10px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:rgba(255,255,255,.94);-webkit-backdrop-filter:saturate(1.6) blur(14px);backdrop-filter:saturate(1.6) blur(14px);border-top:1px solid var(--border)}
  .psp-dock .btn{min-height:52px;font-size:16px;border-radius:14px}
  .psp-dock .bo{flex:0 0 auto;padding:0 20px}
  .psp-dock .bp{flex:1}

  .sbox{position:relative}
  .sugg{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:60;background:#fff;border:1px solid var(--border);border-radius:16px;box-shadow:0 12px 32px rgba(9,29,46,.14);padding:6px;list-style:none;margin:0}
  .sugg button{width:100%;display:flex;align-items:center;gap:12px;min-height:48px;padding:0 10px;border:none;background:none;border-radius:10px;font:500 1rem 'Outfit',sans-serif;color:var(--navy);text-align:start;cursor:pointer;-webkit-tap-highlight-color:transparent}
  .sugg button:active,.sugg button:focus-visible{background:var(--sky)}
  @media(hover:hover){.sugg button:hover{background:var(--sky)}}
  .sugg .ic{width:32px;height:32px;border-radius:9px;background:var(--sky);color:var(--teal-ink);display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .sugg-t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .sugg mark{background:none;color:inherit;font-weight:700}
  .sugg small{margin-inline-start:auto;padding-inline-start:8px;font-size:.8125rem;color:var(--muted);flex-shrink:0}

  .pills{display:flex;flex-wrap:wrap;gap:8px}
  .pill{min-height:44px;padding:0 16px;border-radius:12px;border:1.5px solid var(--border);background:#fff;font:500 .9375rem 'Outfit',sans-serif;color:var(--text);cursor:pointer;font-variant-numeric:tabular-nums;-webkit-tap-highlight-color:transparent;transition:background-color .15s,border-color .15s,color .15s,scale .15s ease-out}
  .pill.on{background:var(--teal-t);border-color:var(--teal-d);color:var(--teal-ink);font-weight:600}
  .pill:active{scale:.96}

  .tierf{display:flex;gap:8px;margin:0 0 12px;flex-wrap:wrap}
  .tierf-n{font-variant-numeric:tabular-nums;font-weight:700;margin-inline-start:4px}
  .sn,.met-n{font-variant-numeric:tabular-nums}

  @media(max-width:700px){
    h1,h2{text-wrap:balance}
    p{text-wrap:pretty}
    .hero-content{padding:30px 16px 30px !important}
    .hero-lockup{gap:10px !important;margin-bottom:4px !important}
    .hero-lockup img{width:42px !important;height:42px !important}
    .hero-lockup span{font-size:50px !important}
    .hero-tag{margin-bottom:12px !important}
    .hero-tag p{font-size:22px !important}
    .hero-mission{font-size:15px !important;line-height:1.6 !important;margin-bottom:18px !important}
    .hero-badge{display:none !important}
    .hero-learn{margin-top:10px !important}
    .res-head{margin-top:2px}
    .res-head h2{font-size:16px}
    .tierf{flex-wrap:nowrap}
  }

  /* ── Pass 2: plain hero, home task list ── */
  .hero2{background:var(--navy);padding:72px 32px 64px}
  .hero2-in{max-width:1120px;margin:0 auto}
  .hero2-h{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(2.5rem,5.6vw,4rem);line-height:1.05;letter-spacing:-.015em;color:#fff;text-wrap:balance;max-width:15ch}
  .hero2-p{font-size:1.0625rem;line-height:1.6;color:rgba(255,255,255,.76);max-width:54ch;margin:16px 0 28px;text-wrap:pretty}
  .hero-search .sfield input{border-color:transparent}
  .hero-learn{margin-top:14px;background:none;border:none;color:rgba(255,255,255,.8);font:500 15px 'Outfit',sans-serif;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0;cursor:pointer}
  .fig{font-family:'Instrument Serif',serif;font-size:2.25rem;line-height:1;color:var(--navy);margin-bottom:8px;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
  .dot{width:6px;height:6px;border-radius:50%;background:var(--sage);flex-shrink:0;margin-top:8px}
  .home-m{background:var(--paper);padding:24px 16px 32px}
  .home-m-h{font-family:'Outfit',sans-serif;font-size:1.0625rem;font-weight:600;color:var(--navy);margin-bottom:10px}
  .home-m-sub{font-size:.875rem;color:var(--muted);margin:-4px 0 12px;line-height:1.5}
  .tasklist{background:#fff;border:1px solid var(--border);border-radius:18px;overflow:hidden}
  .task{display:flex;align-items:center;gap:14px;width:100%;min-height:64px;padding:12px 14px 12px 16px;background:#fff;border:none;text-align:start;font-family:'Outfit',sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background-color .15s}
  .task + .task{border-top:1px solid #E3EBE8}
  .task:active{background:var(--sky)}
  .task-ic{width:36px;height:36px;border-radius:10px;background:var(--teal-t);color:var(--teal-ink);display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .task-t{flex:1;min-width:0}
  .task-t b{display:block;font-size:1rem;font-weight:600;color:var(--navy);line-height:1.3}
  .task-t small{display:block;font-size:.8125rem;color:var(--muted);line-height:1.4;margin-top:2px}
  .task-go{color:#7C8C97;flex-shrink:0}
  @media(max-width:700px){
    .hero2{padding:28px 16px 26px}
    .hero2-h{font-size:2.375rem}
    .hero2-p{font-size:1rem;margin:12px 0 20px}
    .hero-quick{flex-wrap:nowrap;overflow-x:auto;margin-inline:-16px;padding-inline:16px;scrollbar-width:none}
    .hero-quick::-webkit-scrollbar{display:none}
    .hero-quick button{flex-shrink:0}
    .fig{font-size:2rem}
  }
  @media(max-width:360px){.sform .btn{padding:0 14px}.sfield input{padding-right:38px}}

  /* ── Pass 3: patterns from GoodRx, findhelp, Solace, Rx Assistant, Ro ── */
  .hero-checks{list-style:none;padding:0;margin:20px 0 0;display:flex;flex-wrap:wrap;gap:8px 20px}
  .hero-checks li{display:flex;align-items:center;gap:7px;font-size:.875rem;color:rgba(255,255,255,.8)}
  .hero-checks svg{color:#7FD3B4;flex-shrink:0}
  .hm{background:var(--paper);padding:48px 32px 56px;border-bottom:1px solid var(--border)}
  .hm-in{max-width:1120px;margin:0 auto;display:flex;flex-direction:column;gap:44px}
  .hm-h{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(1.625rem,2.6vw,2rem);line-height:1.15;letter-spacing:-.01em;color:var(--navy)}
  .hm-sub{font-size:.9375rem;color:var(--muted);line-height:1.5;margin:4px 0 16px}
  .cats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
  .cat{display:flex;align-items:center;gap:12px;min-height:64px;padding:12px 14px;background:#fff;border:1px solid var(--border);border-radius:14px;text-align:start;font-family:'Outfit',sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background-color .15s,border-color .15s,scale .15s ease-out}
  .cat:active{scale:.96}
  @media(hover:hover){.cat:hover{border-color:#B9CCC7;background:#FBFDFC}}
  .cat-ic{width:38px;height:38px;border-radius:11px;background:var(--teal-t);color:var(--teal-ink);display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .cat-t{min-width:0}
  .cat-t b{display:block;font-size:.9375rem;font-weight:600;color:var(--navy);line-height:1.25}
  .cat-t small{display:block;font-size:.8125rem;color:var(--muted);margin-top:2px;font-variant-numeric:tabular-nums}
  .hm-cols{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:32px;align-items:start}
  .disclaim{font-size:.8125rem;color:var(--muted);line-height:1.5;margin:12px 2px 0}
  .hm-more{margin-top:14px}
  .psp-disc{font-size:.8125rem;color:var(--muted);line-height:1.5;margin-top:8px;padding-top:8px;border-top:1px solid #D7E6E2}
  .cg{background:#fff;padding:56px 32px;border-bottom:1px solid var(--border)}
  .cg-in{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px;align-items:center}
  .cg-h{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(1.75rem,3vw,2.375rem);line-height:1.12;letter-spacing:-.01em;color:var(--navy);text-wrap:balance}
  .cg-p{font-size:1rem;color:var(--text);line-height:1.6;margin:10px 0 20px;max-width:46ch}
  .cg-list{list-style:none;padding:0;margin:0;background:var(--paper);border:1px solid var(--border);border-radius:16px}
  .cg-list li{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;font-size:.9375rem;color:var(--navy);line-height:1.45}
  .cg-list li + li{border-top:1px solid #E3EBE8}
  .cg-list svg{color:var(--teal-d);flex-shrink:0;margin-top:1px}
  .ft{background:var(--navy);color:rgba(255,255,255,.72)}
  .ft-in{max-width:1120px;margin:0 auto;padding:52px 32px 28px}
  .ft-grid{display:grid;grid-template-columns:minmax(0,1.5fr) repeat(3,minmax(0,1fr));gap:40px}
  .ft-logo{display:flex;align-items:center;gap:10px;margin-bottom:10px}
  .ft-logo span{font-family:'Instrument Serif',serif;font-size:1.5rem;color:#fff}
  .ft-brand > p{font-size:.875rem;line-height:1.6;max-width:36ch;margin-bottom:18px}
  .ft-col h2{font-family:'Outfit',sans-serif;font-size:.9375rem;font-weight:600;color:#fff;margin-bottom:10px}
  .ft-col ul{list-style:none;padding:0;margin:0}
  .ft-col button{background:none;border:none;padding:0;min-height:36px;color:rgba(255,255,255,.72);font:400 .9375rem 'Outfit',sans-serif;cursor:pointer;text-align:start;transition:color .15s}
  @media(hover:hover){.ft-col button:hover{color:#fff;text-decoration:underline;text-underline-offset:3px}}
  .ft-bottom{margin-top:36px;padding-top:20px;border-top:1px solid rgba(255,255,255,.12);display:flex;flex-direction:column;gap:6px;font-size:.8125rem;line-height:1.55;color:rgba(255,255,255,.62)}
  .ft-bottom p{max-width:90ch}
  @media(max-width:960px){.cats{grid-template-columns:repeat(3,minmax(0,1fr))}.hm-cols,.cg-in{grid-template-columns:minmax(0,1fr)}.ft-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ft-brand{grid-column:1 / -1}}
  @media(max-width:700px){
    .hero-checks{flex-direction:column;gap:8px;margin-top:18px}
    .hm{padding:28px 16px 36px}
    .hm-in{gap:32px}
    .hm-h{font-size:1.625rem}
    .cats{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .cat{min-height:60px;padding:10px 12px;gap:10px}
    .cat-ic{width:34px;height:34px}
    .hm-more{width:100%}
    .cg{padding:36px 16px}
    .cg-in{gap:24px}
    .cg .btn{width:100%}
    .ft-in{padding:36px 16px 24px}
    .ft-grid{gap:28px 16px}
    .ft-col button{min-height:44px}
  }
  h3:not(.psp-drug){font-family:'Outfit',sans-serif;font-weight:600;letter-spacing:-.005em}
  @media(max-width:700px){.m-py .tc{text-align:start}.m-py .tc p{margin-left:0 !important}}

  /* ── Audit fixes: skip link, touch targets (UUPM 44px), focus ── */
  .skip{position:absolute;left:12px;top:-60px;z-index:1000;background:#fff;color:var(--navy);padding:10px 14px;border-radius:10px;font:600 15px 'Outfit',sans-serif;box-shadow:var(--sh2)}
  .skip:focus{top:12px}
  main:focus{outline:none}
  main:focus-visible{outline:none}
  .auth-link{min-height:44px;padding:0 6px !important}
  @media(max-width:700px){
    .chip,.seg button,.pact,.bsm,.link-btn,.psp-links .link-btn{min-height:44px}
    .nav-r .btn.bg{min-height:44px}
    .nav-logo{min-height:44px}
  }
  @media(min-width:701px){.pact{min-height:36px}}

  /* ═══════════ v4 identity: light pages, dark objects, money in serif ═══════════ */
  :root{--ink:#091D2E;--mist:#F3F6F5;--fog:#DCE4E1;--fog-2:#E8EEEC;--rx:#13805E;--rx-ink:#0F6E50;--rx-tint:#E6F3EE;--card-teal:#0F3B33;--card-navy:#0E2A3F;--card-sage:#DCE8E5;--r-ctl:10px;--r-panel:16px;--r-obj:20px;--ease:cubic-bezier(.2,0,0,1);
    --lift:0 0 0 1px rgba(9,29,46,.05),0 2px 4px -2px rgba(9,29,46,.08),0 12px 32px -12px rgba(9,29,46,.22);
    --lift-lg:0 0 0 1px rgba(9,29,46,.06),0 8px 16px -8px rgba(9,29,46,.14),0 32px 64px -24px rgba(9,29,46,.32)}
  html{scroll-padding-top:80px}
  body{background:var(--mist);color:var(--ink);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
  .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
  ::selection{background:#CDE8DD;color:var(--ink)}

  /* Controls */
  .btn{min-height:44px;padding:0 18px;border-radius:var(--r-ctl);font:600 15px 'Outfit',sans-serif;letter-spacing:-.005em;gap:8px}
  .bsm{min-height:38px;padding:0 14px;font-size:14px}
  .blg{min-height:52px;padding:0 24px;font-size:16px}
  .bp{background:var(--rx);border-color:var(--rx);color:#fff}
  @media(hover:hover){.bp:hover:not(:disabled){background:var(--rx-ink);border-color:var(--rx-ink)}}
  .bo{background:#fff;border:1px solid var(--fog);color:var(--ink)}
  @media(hover:hover){.bo:hover:not(:disabled){background:var(--mist);border-color:#C9D5D1}}
  .bg-ghost{background:none;border:none;color:var(--muted)}
  @media(hover:hover){.bg-ghost:hover{color:var(--ink);background:var(--fog-2)}}
  .btn:disabled{opacity:.45}
  .inp{min-height:48px;border:1px solid #CBD6D2;border-radius:var(--r-ctl);padding:0 14px;font-size:16px;color:var(--ink);background:#fff;transition:border-color .15s,box-shadow .15s}
  textarea.inp{padding:12px 14px;min-height:auto;resize:vertical;line-height:1.55}
  .inp::placeholder{color:#7A8893}
  .inp:focus{border-color:var(--rx);box-shadow:0 0 0 4px rgba(19,128,94,.14)}
  .inp[aria-invalid="true"]{border-color:var(--rose)}
  .lbl{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:6px}
  .opt{font-weight:400;color:var(--muted);margin-inline-start:4px}
  .chip{min-height:40px;padding:0 16px;border-radius:999px;border:1px solid var(--fog);background:#fff;color:var(--ink);font:500 14.5px 'Outfit',sans-serif}
  .chip.on{background:var(--ink);border-color:var(--ink);color:#fff}
  @media(hover:hover){.chip:hover{background:var(--mist);color:var(--ink);border-color:#C9D5D1}.chip.on:hover{background:var(--ink);color:#fff}}
  :focus-visible{outline:2px solid var(--rx);outline-offset:2px}

  /* Navigation: one light bar everywhere */
  .nav{height:64px;padding:0 28px;gap:24px;background:rgba(255,255,255,.88);-webkit-backdrop-filter:saturate(1.8) blur(14px);backdrop-filter:saturate(1.8) blur(14px);border-bottom:1px solid var(--fog);box-shadow:none}
  .nav-logo{display:flex;align-items:center;gap:9px;background:none;border:none;padding:0;min-height:44px;cursor:pointer}
  .nav-logo span{font-family:'Instrument Serif',serif;font-size:25px;line-height:1;color:var(--ink);letter-spacing:-.01em}
  .nav-links{list-style:none;display:flex;gap:2px;flex:1;margin:0;padding:0;overflow:visible}
  .nl{min-height:40px;padding:0 12px;border:none;background:none;border-radius:8px;font:500 14.5px 'Outfit',sans-serif;color:#46566A;cursor:pointer;transition:background-color .15s,color .15s;white-space:nowrap}
  @media(hover:hover){.nl:hover{background:var(--fog-2);color:var(--ink)}}
  .nl.on{color:var(--ink);background:var(--fog-2)}
  .nav-r{gap:8px}
  @media(max-width:700px){
    .nav{height:calc(56px + env(safe-area-inset-top));padding:env(safe-area-inset-top) 16px 0;background:rgba(255,255,255,.92);border-bottom:1px solid var(--fog)}
    .nav-r .btn.bg,.nav-r .btn.bo{background:#fff;color:var(--ink);border-color:var(--fog);min-height:44px}
  }
  .mtab{background:rgba(255,255,255,.94);border-top:1px solid var(--fog)}
  .mtab button.on .ic{background:var(--rx-tint);color:var(--rx-ink)}

  /* Page headers: light, large serif */
  .pghead{background:transparent;padding:56px 32px 8px}
  .pghead-in,.pghead > div{max-width:1160px;margin:0 auto}
  .pghead h1{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(2.4rem,4.6vw,3.4rem);line-height:1.02;letter-spacing:-.02em;color:var(--ink);margin-bottom:12px;text-wrap:balance}
  .pghead p{font-size:1.0625rem;line-height:1.6;color:var(--muted);max-width:62ch;margin-bottom:24px}
  .seg{display:inline-flex;gap:4px;background:#fff;border:1px solid var(--fog);border-radius:12px;padding:4px;max-width:none}
  .seg button{min-height:40px;padding:0 16px;color:#46566A;border-radius:8px;font:600 14.5px 'Outfit',sans-serif;flex:0 0 auto}
  .seg button.on{background:var(--ink);color:#fff;box-shadow:none}
  .ahero{background:transparent;padding:64px 32px 32px}
  .ahero h1{color:var(--ink);font-size:clamp(2.2rem,4.4vw,3.2rem);letter-spacing:-.02em;line-height:1.05}
  .ahero p{color:var(--muted)}
  .tbar{background:transparent}

  /* Search field */
  .sfield input{height:56px;border:1px solid #CBD6D2;border-radius:14px;font:500 17px 'Outfit',sans-serif;color:var(--ink);background:#fff;box-shadow:0 1px 2px rgba(9,29,46,.04);transition:border-color .15s,box-shadow .15s}
  .sfield input:focus{border-color:var(--rx);box-shadow:0 0 0 4px rgba(19,128,94,.14)}
  .sform .btn{min-height:56px;border-radius:14px;padding:0 24px;font-size:16px}

  /* ── Copay card ── */
  .ccard{position:relative;aspect-ratio:1.586;border-radius:var(--r-obj);padding:18px 20px;display:flex;flex-direction:column;overflow:hidden;font-family:'Outfit',sans-serif;box-shadow:var(--lift);isolation:isolate}
  .ccard::after{content:'';position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(255,255,255,.10);pointer-events:none}
  .ccard::before{content:'';position:absolute;width:62%;aspect-ratio:1;right:-18%;top:-34%;border-radius:50%;border:1px solid currentColor;opacity:.12;z-index:-1}
  .ccard-teal{background:var(--card-teal);color:#fff}
  .ccard-navy{background:var(--card-navy);color:#fff}
  .ccard-sage{background:var(--card-sage);color:var(--ink)}
  .ccard-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
  .ccard-prog{font-weight:600;font-size:1rem;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .ccard-tier{font-size:.75rem;font-weight:600;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.14);white-space:nowrap}
  .ccard-sage .ccard-tier{background:rgba(9,29,46,.07)}
  .ccard-maker{font-size:.8125rem;opacity:.78;margin-top:2px}
  .ccard-foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;gap:10px}
  .ccard-price small{display:block;font-size:.75rem;opacity:.8;margin-bottom:2px}
  .ccard-price b{display:block;font-family:'Instrument Serif',serif;font-weight:400;font-size:2.75rem;line-height:.95;letter-spacing:-.01em;font-variant-numeric:tabular-nums;white-space:nowrap}
  .ccard-price i{font-style:normal;font-family:'Outfit',sans-serif;font-size:.875rem;opacity:.85;margin-inline-start:4px}
  .ccard-drug{font-size:.8125rem;font-weight:500;opacity:.8;text-align:end}
  .ccard-sm{padding:14px 16px}
  .ccard-sm .ccard-price b{font-size:2.1rem}

  /* ── Hero ── */
  .hero4{padding:72px 32px 80px;background:var(--mist)}
  .hero4-in{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:56px;align-items:center}
  .hero4-h{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(2.75rem,6vw,4.75rem);line-height:.98;letter-spacing:-.025em;color:var(--ink);max-width:13ch;text-wrap:balance}
  .hero4-p{font-size:1.1875rem;line-height:1.55;color:#3E4F5D;max-width:46ch;margin:22px 0 28px;text-wrap:pretty}
  .hero4-search{display:flex;gap:8px;max-width:560px;padding:6px;background:#fff;border:1px solid var(--fog);border-radius:18px;box-shadow:var(--lift)}
  .hero4-search .sfield input{border-color:transparent;box-shadow:none;height:52px}
  .hero4-search .sfield input:focus{border-color:transparent;box-shadow:none}
  .hero4-search:focus-within{border-color:var(--rx);box-shadow:0 0 0 4px rgba(19,128,94,.14),var(--lift)}
  .hero4-search .btn{min-height:52px;border-radius:12px;padding:0 22px;font-size:16px}
  .hero-quick{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:16px}
  .hero-quick > span{font-size:.875rem;color:var(--muted);margin-inline-end:4px}
  .hero-quick button{min-height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--fog);background:transparent;color:var(--ink);font:500 14px 'Outfit',sans-serif;cursor:pointer;transition:background-color .15s,border-color .15s}
  @media(hover:hover){.hero-quick button:hover{background:#fff;border-color:#C9D5D1}}
  .hero-checks{list-style:none;padding:0;margin:28px 0 0;display:flex;flex-wrap:wrap;gap:8px 22px}
  .hero-checks li{display:flex;align-items:center;gap:7px;font-size:.9375rem;color:#3E4F5D}
  .hero-checks svg{color:var(--rx);flex-shrink:0}
  .hcards{position:relative;height:420px}
  .hc{position:absolute;width:min(100%,380px);left:50%;top:50%}
  .hc-0{transform:translate(-50%,-50%) translate(-30%,-36%) rotate(-8deg);z-index:1}
  .hc-1{transform:translate(-50%,-50%) translate(26%,-12%) rotate(7deg);z-index:2}
  .hc-2{transform:translate(-50%,-50%) translate(2%,30%) rotate(-3deg);z-index:3;box-shadow:var(--lift-lg)}
  @media(prefers-reduced-motion:no-preference){
    .hc{animation:hcIn .9s var(--ease) backwards}
    .hc-0{animation-delay:.05s}.hc-1{animation-delay:.14s}.hc-2{animation-delay:.23s}
  }
  @keyframes hcIn{from{transform:translate(-50%,-50%) rotate(0);opacity:0}}

  /* ── Home sections ── */
  .hm{background:#fff;padding:72px 32px;border-top:1px solid var(--fog);border-bottom:1px solid var(--fog)}
  .hm-in{max-width:1160px;gap:64px}
  .hm-h{font-size:clamp(1.75rem,3vw,2.25rem);letter-spacing:-.015em}
  .hm-h-sm{font-size:1.5rem;margin-top:32px}
  .hm-sub{font-size:1rem;margin:6px 0 20px;max-width:58ch}
  .cats{gap:12px}
  .cat{min-height:72px;border-radius:14px;border:1px solid var(--fog);background:#fff;padding:14px 16px}
  @media(hover:hover){.cat:hover{background:var(--mist);border-color:#C9D5D1}}
  .cat-ic{background:var(--rx-tint);color:var(--rx-ink);border-radius:10px}
  .hm-cols{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:48px}
  .qualify{background:var(--ink);color:#fff;border-radius:var(--r-obj);padding:28px;box-shadow:var(--lift)}
  .qualify .hm-h{color:#fff}
  .qualify p{color:rgba(255,255,255,.8);font-size:1rem;line-height:1.6;margin:8px 0 18px;max-width:44ch}
  .qualify-steps{list-style:none;padding:0;margin:0 0 22px;display:flex;gap:8px;flex-wrap:wrap;counter-reset:q}
  .qualify-steps li{counter-increment:q;display:flex;align-items:center;gap:8px;font-size:.9375rem;color:#fff;padding:6px 12px 6px 6px;border-radius:999px;background:rgba(255,255,255,.08)}
  .qualify-steps li::before{content:counter(q);width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:.8125rem;font-weight:600}
  .qualify .btn{background:#fff;color:var(--ink);border-color:#fff}
  @media(hover:hover){.qualify .btn:hover:not(:disabled){background:var(--rx-tint);border-color:var(--rx-tint)}}
  .tasklist,.pgroup{border-color:var(--fog);border-radius:var(--r-panel)}
  .task{min-height:68px}
  .task-ic{background:var(--rx-tint);color:var(--rx-ink)}
  @media(hover:hover){.task:hover{background:var(--mist)}}
  .how{background:var(--mist);padding:88px 32px}
  .how-in{max-width:1160px;margin:0 auto}
  .how-h{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(2rem,3.6vw,2.75rem);letter-spacing:-.02em;color:var(--ink);margin-bottom:36px}
  .how-steps{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border-top:1px solid #C9D5D1}
  .how-steps li{padding:28px 32px 0 0;position:relative}
  .how-steps li + li{padding-left:32px;border-left:1px solid var(--fog)}
  .how-n{font-family:'Instrument Serif',serif;font-size:3rem;line-height:1;color:var(--rx);display:block;margin-bottom:16px;font-variant-numeric:tabular-nums}
  .how-steps h3{font-size:1.1875rem;color:var(--ink);margin-bottom:8px}
  .how-steps p{font-size:1rem;line-height:1.6;color:#3E4F5D;max-width:36ch}
  .how-link{margin-top:14px;display:inline-flex;align-items:center;gap:2px;min-height:44px;padding:0;border:none;background:none;color:var(--rx-ink);font:600 15px 'Outfit',sans-serif;cursor:pointer}
  @media(hover:hover){.how-link:hover{text-decoration:underline;text-underline-offset:4px}}
  .cg{background:#fff}
  .cg-list{background:var(--mist);border-color:var(--fog)}

  /* ── Program rows, split view, detail ── */
  .prow{padding:18px 18px 16px 20px}
  @media(hover:hover){.prow:hover{background:#F7FAF9}}
  .prow.on{background:var(--rx-tint)}
  .prow-name{font-size:1.75rem}
  .split{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:24px;align-items:start}
  .split-list{position:sticky;top:88px}
  .split-detail{position:sticky;top:88px;max-height:calc(100vh - 108px);overflow-y:auto;overscroll-behavior:contain;background:#fff;border:1px solid var(--fog);border-radius:var(--r-obj);box-shadow:var(--lift)}
  .split-detail .psp-dock{border-radius:0 0 var(--r-obj) var(--r-obj)}
  .pd-head{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:24px;align-items:center;padding:24px 24px 4px}
  .pd-card{width:100%}
  .pd-id .psp-drug{font-size:2.25rem;line-height:1.04;letter-spacing:-.015em}
  .pd-id .psp-sub{margin-top:6px;font-size:15px}
  .pd-meta{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;margin-top:10px;font-size:14px;color:var(--muted)}
  .pd-id .score{margin-top:12px}
  .pd-cost{margin:18px 24px 0;padding:16px 18px;border-radius:14px;background:var(--mist);border:1px solid var(--fog)}
  .pd-cost p{font-size:15px;line-height:1.6;color:var(--ink)}
  .pd-cost .psp-disc{color:var(--muted);font-size:13.5px;border-top-color:var(--fog)}
  .in-sheet .psp-why{margin:14px 24px 0}
  .in-sheet .psp-conditions,.in-sheet .psp-body,.in-sheet .psp-links{padding-left:24px;padding-right:24px}
  .psp-section-title{font-family:'Outfit',sans-serif;font-size:1rem;font-weight:600;color:var(--ink)}
  .psp-elig,.psp-step p,.psp-bullet p{font-size:15.5px;line-height:1.65;color:#2B3B49}
  .psp-step-num{background:var(--ink)}
  .psp-cond{border-color:var(--fog);font-size:13px}
  .faq-item{border-color:var(--fog);border-radius:12px}
  .psp-dock{padding-left:24px;padding-right:24px}
  .psheet{border-radius:var(--r-obj) var(--r-obj) 0 0}

  /* ── Eligibility questionnaire ── */
  .quiz{max-width:760px;background:#fff;border:1px solid var(--fog);border-radius:var(--r-obj);padding:32px;box-shadow:var(--lift)}
  .quiz-top{display:flex;align-items:center;gap:16px;margin-bottom:28px}
  .quiz-count{font-size:14px;font-weight:600;color:var(--muted);white-space:nowrap;font-variant-numeric:tabular-nums}
  .quiz-bar{flex:1;height:6px;border-radius:999px;background:var(--fog-2);overflow:hidden}
  .quiz-bar span{display:block;height:100%;background:var(--rx);border-radius:inherit;transition:width .35s var(--ease)}
  @media(prefers-reduced-motion:no-preference){.quiz-step{animation:qIn .32s var(--ease) backwards}}
  @keyframes qIn{from{opacity:0;transform:translateY(8px)}}
  .rcards{border:none;padding:0;margin:0 0 24px;min-width:0}
  .q-legend{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(1.75rem,3.2vw,2.25rem);line-height:1.12;letter-spacing:-.015em;color:var(--ink);padding:0;margin-bottom:6px;text-wrap:balance}
  .q-legend:focus{outline:none}
  .coach-form .q-legend,.coach-form .rcards .q-legend{font-family:'Outfit',sans-serif;font-size:1rem;font-weight:600;letter-spacing:0;margin-bottom:8px}
  .q-hint{font-size:1rem;color:var(--muted);margin-bottom:18px;max-width:60ch}
  .q-input{max-width:520px;min-height:56px;font-size:17px}
  .q-err{color:var(--rose);font-size:15px;margin-top:10px}
  .q-common{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
  .rcards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
  .rcard{position:relative;display:flex;align-items:flex-start;gap:12px;min-height:60px;padding:14px 16px;border:1px solid var(--fog);border-radius:14px;background:#fff;cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s}
  @media(hover:hover){.rcard:hover{border-color:#B9CCC7}}
  .rcard input{position:absolute;opacity:0;width:1px;height:1px}
  .rcard-t{flex:1;min-width:0}
  .rcard-t b{display:block;font-size:1rem;font-weight:600;color:var(--ink);line-height:1.3;font-variant-numeric:tabular-nums}
  .rcard-t small{display:block;font-size:.875rem;color:var(--muted);line-height:1.45;margin-top:3px}
  .rcard-dot{width:20px;height:20px;border-radius:50%;border:1.5px solid #9DB0AA;flex-shrink:0;margin-top:1px;transition:border-color .15s,border-width .15s}
  .rcard.on{border-color:var(--rx);background:var(--rx-tint);box-shadow:0 0 0 1px var(--rx)}
  .rcard.on .rcard-dot{border:6px solid var(--rx)}
  .rcard:has(input:focus-visible){outline:2px solid var(--rx);outline-offset:2px}
  .quiz-nav{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:8px;padding-top:20px;border-top:1px solid var(--fog-2)}
  .quiz-nav-r{display:flex;gap:8px}
  .quiz-nav .btn{min-height:48px;padding:0 22px}
  .quiz-sum{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:14px 18px;background:#fff;border:1px solid var(--fog);border-radius:14px;margin-bottom:20px}
  .quiz-sum p{font-size:15px;color:var(--ink)}
  .quiz-sum p span{color:var(--muted)}

  /* ── Enrollment coach ── */
  .coach-body{max-width:1224px;margin:0 auto;padding:16px 32px 64px}
  .stepper{list-style:none;padding:0;margin:4px 0 0;display:flex;gap:8px;flex-wrap:wrap;counter-reset:none}
  .stepper button{display:flex;align-items:center;gap:10px;min-height:44px;padding:0 16px 0 6px;border-radius:999px;border:1px solid var(--fog);background:#fff;font:500 15px 'Outfit',sans-serif;color:var(--muted);cursor:pointer}
  .stepper button:disabled{cursor:default;opacity:1}
  .st-n{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;background:var(--fog-2);color:var(--muted)}
  .st-now button{border-color:var(--ink);color:var(--ink);font-weight:600}
  .st-now .st-n{background:var(--ink);color:#fff}
  .st-done button{color:var(--ink)}
  .st-done .st-n{background:var(--rx-tint);color:var(--rx-ink)}
  .panel{background:#fff;border:1px solid var(--fog);border-radius:var(--r-obj);padding:28px}
  .panel-h{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(1.75rem,3vw,2.25rem);letter-spacing:-.015em;line-height:1.1;color:var(--ink);margin-bottom:6px}
  .panel-h:focus{outline:none}
  .panel-p{font-size:1rem;color:var(--muted);line-height:1.6;margin-bottom:20px;max-width:62ch}
  .coach-form{max-width:880px}
  .coach-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:28px}
  .coach-form .rcards-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
  .coach-form .rcard{min-height:52px;padding:12px 14px;align-items:center}
  .panel-actions{padding-top:8px}
  .plan-sum{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;padding:16px 20px;background:#fff;border:1px solid var(--fog);border-radius:var(--r-panel);margin-bottom:28px}
  .plan-sum dl{display:flex;flex-wrap:wrap;gap:8px 28px;margin:0}
  .plan-sum dt{font-size:13px;color:var(--muted)}
  .plan-sum dd{margin:0;font-size:15px;font-weight:600;color:var(--ink)}
  .brief{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:16px 0 20px}
  .brief-sec{background:#fff;border:1px solid var(--fog);border-radius:var(--r-panel);padding:22px 24px}
  .brief-sec:first-child{grid-row:span 2}
  .brief-h{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:12px}
  .brief-h h3{font-size:1.0625rem;color:var(--ink)}
  .brief-count{font-size:14px;color:var(--rx-ink);font-weight:600;white-space:nowrap;font-variant-numeric:tabular-nums}
  .checklist,.avoid-list,.plain-list,.qa-list{list-style:none;padding:0;margin:0}
  .checklist li + li{border-top:1px solid var(--fog-2)}
  .checklist label{display:flex;gap:12px;align-items:flex-start;padding:12px 0;cursor:pointer;font-size:15px;line-height:1.5;color:var(--ink)}
  .checklist input{width:20px;height:20px;margin-top:1px;accent-color:var(--rx);flex-shrink:0}
  .checklist input:checked + span{color:var(--muted);text-decoration:line-through;text-decoration-color:#9DB0AA}
  .qa-list{counter-reset:qa}
  .qa-list li{counter-increment:qa;position:relative;padding:10px 0 10px 34px;font-size:15px;line-height:1.55}
  .qa-list li + li{border-top:1px solid var(--fog-2)}
  .qa-list li::before{content:counter(qa);position:absolute;left:0;top:11px;width:22px;height:22px;border-radius:50%;background:var(--fog-2);font-size:12.5px;font-weight:600;display:flex;align-items:center;justify-content:center;color:var(--ink)}
  .qa-list b{display:block;font-weight:600;color:var(--ink)}
  .qa-list span{display:block;color:#3E4F5D;margin-top:2px}
  .avoid-list li{display:flex;gap:10px;padding:8px 0;font-size:15px;line-height:1.55;color:var(--ink)}
  .avoid-list svg{color:var(--rose);flex-shrink:0;margin-top:3px}
  .plain-list li{padding:6px 0;font-size:15px}
  .brief-p{font-size:15px;line-height:1.6;color:#2B3B49}
  .brief-raw{white-space:pre-wrap;background:#fff;border:1px solid var(--fog);border-radius:var(--r-panel);padding:24px;font-size:15px;line-height:1.7;margin:16px 0}
  .call-card{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;background:var(--ink);color:#fff;border-radius:var(--r-obj);padding:24px 28px;box-shadow:var(--lift)}
  .call-card h3{font-family:'Instrument Serif',serif;font-weight:400;font-size:1.625rem;line-height:1.15;color:#fff;margin-bottom:4px}
  .call-card p{color:rgba(255,255,255,.8);font-size:15px}
  .call-actions{display:flex;gap:8px}
  .call-card .bo{background:transparent;color:#fff;border-color:rgba(255,255,255,.3)}
  .call-card .bp{background:#fff;color:var(--ink);border-color:#fff}
  .live-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}
  .live-top-r{display:flex;gap:8px}
  .live{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:16px;align-items:start}
  .live .panel{display:flex;flex-direction:column;gap:12px}
  .live-h{font-size:1.0625rem;font-weight:600;color:var(--ink);font-family:'Outfit',sans-serif}
  .live .panel-p{margin-bottom:0}
  .chat{display:flex;flex-direction:column;gap:10px;max-height:360px;overflow-y:auto;overscroll-behavior:contain;padding:2px}
  .bubble{max-width:88%;padding:12px 14px;border-radius:14px;font-size:15px;line-height:1.55}
  .bubble p{white-space:pre-wrap}
  .bubble.them{align-self:flex-start;background:var(--mist);border:1px solid var(--fog)}
  .bubble.you{align-self:flex-end;background:var(--rx-tint);border:1px solid #BFE0D2}
  .bubble-who{display:block;font-size:12.5px;font-weight:600;color:var(--muted);margin-bottom:2px}
  .bubble.you .bubble-who{color:var(--rx-ink)}
  .verdict{border:1px solid;border-radius:12px;padding:12px 14px}
  .verdict-q{display:block;font-size:13px;color:var(--muted);margin-bottom:4px}
  .verdict p{font-size:15px;line-height:1.6;white-space:pre-wrap}
  .outcome{margin-top:16px;border:1px solid var(--fog)}
  .outcome legend{padding:0 4px}
  .outcome-opts{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
  .outcome-done{margin-top:16px}
  .outcome-done.ok{background:var(--rx-tint);border-color:#BFE0D2}

  /* ── Responsive ── */
  @media(max-width:1023px){
    .hm-cols{grid-template-columns:minmax(0,1fr);gap:40px}
    .hero4-in{grid-template-columns:minmax(0,1fr);gap:40px}
    .hcards{height:300px;max-width:520px}
    .hc{width:min(78%,340px)}
    .pd-head{grid-template-columns:minmax(0,1fr)}
    .pd-card{max-width:340px}
    .brief{grid-template-columns:minmax(0,1fr)}
    .brief-sec:first-child{grid-row:auto}
    .live{grid-template-columns:minmax(0,1fr)}
    .how-steps{grid-template-columns:minmax(0,1fr)}
    .how-steps li,.how-steps li + li{padding:24px 0 24px;border-left:none;border-bottom:1px solid var(--fog)}
    .how-n{font-size:2.5rem;margin-bottom:10px}
  }
  @media(max-width:700px){
    .pghead{padding:28px 16px 4px}
    .pghead h1{font-size:2.375rem}
    .pghead p{font-size:1rem;margin-bottom:18px}
    .seg{display:flex;width:100%}
    .seg button{flex:1;padding:0 8px;min-height:44px}
    .ahero{padding:36px 16px 16px}
    .hero4{padding:28px 16px 44px}
    .hero4-h{font-size:2.75rem}
    .hero4-p{font-size:1.0625rem;margin:14px 0 20px}
    .hero4-search{padding:5px;border-radius:16px}
    .hero4-search .sfield input{height:50px}
    .hero4-search .btn{min-height:50px;padding:0 16px}
    .hero-quick{flex-wrap:nowrap;overflow-x:auto;margin-inline:-16px;padding-inline:16px;scrollbar-width:none}
    .hero-quick::-webkit-scrollbar{display:none}
    .hero-quick button{flex-shrink:0;min-height:44px}
    .hero-checks{flex-direction:column;gap:8px;margin-top:20px}
    .hcards{height:230px;margin-top:4px}
    .hc{width:min(68%,250px)}
    .hc-0{transform:translate(-50%,-50%) translate(-24%,-30%) rotate(-7deg)}
    .hc-1{transform:translate(-50%,-50%) translate(22%,-10%) rotate(6deg)}
    .hc-2{transform:translate(-50%,-50%) translate(0%,26%) rotate(-3deg)}
    .hc .ccard-price b{font-size:2rem}
    .hm{padding:40px 16px}
    .hm-in{gap:40px}
    .how{padding:56px 16px}
    .how-h{margin-bottom:20px}
    .pd-head{padding:8px 16px 4px;gap:16px}
    .pd-id .psp-drug{font-size:2rem}
    .pd-cost{margin:16px 16px 0}
    .in-sheet .psp-why{margin:12px 16px 0}
    .in-sheet .psp-conditions,.in-sheet .psp-body,.in-sheet .psp-links{padding-left:16px;padding-right:16px}
    .psp-dock{padding-left:16px;padding-right:16px}
    .quiz{padding:20px 16px;border-radius:var(--r-panel)}
    .quiz-top{margin-bottom:20px}
    .q-legend{font-size:1.875rem}
    .rcards-grid,.coach-form .rcards-grid{grid-template-columns:minmax(0,1fr)}
    .quiz-nav .btn{min-height:50px}
    .coach-body{padding:12px 16px 48px}
    .stepper{flex-wrap:nowrap;gap:6px}
    .stepper li:not(.st-now) .st-l{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
    .stepper li:not(.st-now) button{padding:0 6px}
    .chip,.tierf .chip,.q-common .chip{min-height:44px}
    .panel{padding:20px 16px;border-radius:var(--r-panel)}
    .coach-fields{grid-template-columns:minmax(0,1fr)}
    .brief-sec{padding:18px 16px}
    .call-card{padding:20px}
    .call-actions{width:100%}
    .call-actions .btn{flex:1}
  }
  .search-body{max-width:1224px;margin:0 auto;padding:12px 32px 64px}
  .search-body .s-sticky,.search-body .sbox{max-width:760px}
  .split-detail .pd-head{grid-template-columns:minmax(0,1fr);gap:20px}
  .split-detail .pd-card{max-width:300px}
  @media(max-width:700px){.search-body{padding:8px 16px 40px}}
  /* Web Interface Guidelines pass */
  a.nl,a.nav-logo{text-decoration:none;display:inline-flex;align-items:center}
  .ft-col a{display:inline-flex;align-items:center;min-height:36px;color:rgba(255,255,255,.72);font:400 .9375rem 'Outfit',sans-serif;text-decoration:none;transition:color .15s}
  @media(hover:hover){.ft-col a:hover{color:#fff;text-decoration:underline;text-underline-offset:3px}}
  .mtab a{min-height:var(--tab-h);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:var(--muted);font:600 12px 'Outfit',sans-serif;text-decoration:none;-webkit-tap-highlight-color:transparent}
  .mtab a.on{color:var(--navy)}
  .mtab a.on .ic{background:var(--rx-tint);color:var(--rx-ink)}
  .mtab a:active .ic{background:var(--sky)}
  .msheet-bg,.psheet-bg{border:none;padding:0;cursor:default}
  @media(hover:hover){
    .stepper button:not(:disabled):hover{background:var(--mist);border-color:#C9D5D1}
    .psheet-x:hover,.msheet-x:hover{background:var(--fog)}
    .link-btn:hover{background:var(--mist)}
  }
  @media(pointer:fine){html{overscroll-behavior:none}}
  @media(max-width:700px){.ft-col a{min-height:44px}}
  /* ══ v5 · Home ══ */
  :root{--e2:0 0 0 1px rgba(9,29,46,.06),0 12px 24px -12px rgba(9,29,46,.18),0 32px 64px -24px rgba(9,29,46,.28);--sec:96px;--gut:32px}
  .hero4{padding:88px var(--gut) 104px}
  .hero4-h{font-size:clamp(3rem,6.6vw,5.9375rem);line-height:.95;letter-spacing:-.03em;max-width:12ch}
  .hero4-p{font-size:1.25rem;max-width:44ch;margin:28px 0 32px;color:#3B4C5A}
  .hs{position:relative;max-width:580px}
  .hs .hero4-search{max-width:none}
  .hs-list{position:absolute;z-index:30;top:calc(100% + 8px);left:0;right:0;list-style:none;margin:0;padding:6px;background:#fff;border:1px solid var(--fog);border-radius:16px;box-shadow:var(--e2)}
  @media(prefers-reduced-motion:no-preference){.hs-list{animation:hsIn .15s var(--ease)}}
  @keyframes hsIn{from{opacity:0;transform:translateY(-4px)}}
  .hs-list li{display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:12px;min-height:56px;padding:8px 12px 8px 8px;border-radius:10px;cursor:pointer}
  .hs-list li.on{background:var(--mist)}
  .hs-ic{width:36px;height:36px;border-radius:9px;background:var(--rx-tint);color:var(--rx-ink);display:flex;align-items:center;justify-content:center}
  .hs-t{display:flex;flex-direction:column;min-width:0}
  .hs-t b{font-weight:600;font-size:1rem;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hs-t b mark{background:none;color:var(--rx-ink);text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px}
  .hs-t small{font-size:.8125rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hs-v{font-size:.875rem;color:var(--muted);white-space:nowrap;font-variant-numeric:tabular-nums}
  .hs-v.money{font-family:'Instrument Serif',serif;font-size:1.375rem;color:var(--rx-ink);letter-spacing:-.01em}
  .hcards-wrap{position:relative}
  .hcards{transform:perspective(1400px) rotateY(var(--tx,0deg)) rotateX(var(--ty,0deg));transition:transform .42s var(--ease);will-change:transform}
  .hm{padding:var(--sec) var(--gut)}
  .sec-head{margin-bottom:24px}
  .sec-head .hm-sub{margin-bottom:0}
  .hm-more{margin-top:20px}

  /* Data story: one square per program */
  .story{background:var(--ink);color:#fff;padding:128px var(--gut)}
  .story-in{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);grid-template-rows:auto 1fr;gap:0 80px;align-items:start}
  .story-copy{grid-column:1;grid-row:1}.story-facts{grid-column:1;grid-row:2;align-self:start}.waffle-fig{grid-column:2;grid-row:1 / span 2}
  .on-touch{display:none}@media(hover:none){.on-touch{display:inline}.on-hover{display:none}}
  .story-h{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(2.5rem,4.8vw,3.8125rem);line-height:1;letter-spacing:-.025em;color:#fff;max-width:13ch;text-wrap:balance}
  .story-p{font-size:1.125rem;line-height:1.6;color:rgba(255,255,255,.78);max-width:44ch;margin:24px 0 0;text-wrap:pretty}
  .story-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin:48px 0 0;padding-top:24px;border-top:1px solid rgba(255,255,255,.16)}
  .story-facts dt{font-family:'Instrument Serif',serif;font-size:2.4375rem;line-height:1;color:#fff;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
  .story-facts dd{margin:8px 0 0;font-size:.9375rem;line-height:1.5;color:rgba(255,255,255,.7)}
  .waffle-fig{margin:0;padding:32px;border-radius:24px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)}
  .waffle{display:grid;grid-template-columns:repeat(16,minmax(0,1fr));gap:6px}
  .wsq{display:block;aspect-ratio:1;border-radius:4px;background:#7FDDB7;transition:transform .15s var(--ease)}
  .wsq-low{background:#4AAA88}
  .wsq-more{background:#2F735F}
  .wsq-varies{background:transparent;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.5)}
  .waffle .wsq.on{box-shadow:0 0 0 2px var(--ink),0 0 0 4px #fff;transform:scale(1.08)}
  .waffle .wsq-varies.on{box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.5),0 0 0 2px var(--ink),0 0 0 4px #fff}
  .waffle-cap{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;min-height:56px;margin-top:20px;padding:12px 0;border-top:1px solid rgba(255,255,255,.12);font-size:.9375rem;color:rgba(255,255,255,.7)}
  .waffle-cap b{font-weight:600;color:#fff;font-size:1rem}
  .waffle-cap em{font-style:normal;font-family:'Instrument Serif',serif;font-size:1.375rem;color:#fff;margin-left:auto}
  .waffle-key{list-style:none;padding:0;margin:4px 0 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 24px}
  .waffle-key li{display:flex;align-items:center;gap:10px;font-size:.9375rem;color:rgba(255,255,255,.78)}
  .waffle-key .wsq{width:14px;flex-shrink:0}
  .waffle-key b{color:#fff;font-weight:600;font-variant-numeric:tabular-nums;min-width:2ch}
  .waffle-note{margin:20px 0 0;font-size:.8125rem;line-height:1.5;color:rgba(255,255,255,.6);max-width:62ch}

  .how{padding:var(--sec) var(--gut)}
  .cg{padding:var(--sec) var(--gut)}

  /* What's under the hood: rows, not cards */
  .hood{background:var(--mist);padding:var(--sec) var(--gut);border-top:1px solid var(--fog)}
  .hood-in{max-width:1160px;margin:0 auto}
  .hood-list{list-style:none;padding:0;margin:0;background:#fff;border:1px solid var(--fog);border-radius:var(--r-panel)}
  .hood-list li{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:20px;align-items:start;padding:24px}
  .hood-list li + li{border-top:1px solid var(--fog)}
  .hood-ic{width:44px;height:44px;border-radius:12px;background:var(--rx-tint);color:var(--rx-ink);display:flex;align-items:center;justify-content:center}
  .hood-list h3{font-size:1.125rem;font-weight:600;color:var(--ink);margin:0 0 4px}
  .hood-list p{font-size:1rem;line-height:1.6;color:#3E4F5D;max-width:62ch;margin:0}
  .hood-status{display:inline-flex;align-items:center;gap:8px;min-height:28px;padding:0 12px;border-radius:999px;border:1px solid var(--fog);font-size:.8125rem;font-weight:600;color:var(--muted);white-space:nowrap}
  .hood-status::before{content:"";width:8px;height:8px;border-radius:50%;border:1.5px solid currentColor}
  .hood-status.live{color:var(--rx-ink);background:var(--rx-tint);border-color:#BFE0D2}
  .hood-status.live::before{background:currentColor}

  .closing{background:#fff;padding:128px var(--gut);border-top:1px solid var(--fog)}
  .closing-in{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:32px 64px;align-items:end}
  .closing-h{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(2.75rem,6vw,4.75rem);line-height:.98;letter-spacing:-.03em;color:var(--ink);max-width:12ch;grid-column:1}
  .closing-in > p{grid-column:1;font-size:1.125rem;line-height:1.6;color:#3E4F5D;max-width:48ch;margin:0}
  .closing-actions{grid-column:2;grid-row:1 / span 2;display:flex;gap:12px;align-self:end}

  @media(max-width:1023px){
    .story-in{grid-template-columns:minmax(0,1fr);gap:0}.story-copy,.story-facts,.waffle-fig{grid-column:1;grid-row:auto}.waffle-fig{margin-top:40px;order:2}.story-facts{order:3}
    .closing-in{grid-template-columns:minmax(0,1fr)}
    .closing-actions{grid-column:1;grid-row:auto}
  }
  @media(max-width:700px){
    :root{--sec:56px;--gut:16px}
    .hero4{padding:32px 16px 48px}
    .hero4-h{font-size:clamp(2.5rem,11.5vw,3.25rem)}
    .hero4-p{font-size:1.0625rem;margin:16px 0 22px}
    .hs-list li{min-height:60px}
    .story{padding:64px 16px}
    .story-facts{grid-template-columns:minmax(0,1fr);margin-top:32px}
    .waffle-fig{padding:20px 16px;border-radius:20px}
    .waffle{gap:4px}
    .wsq{border-radius:3px}
    .waffle-key{grid-template-columns:minmax(0,1fr)}
    .hood-list li{grid-template-columns:40px minmax(0,1fr);gap:14px;padding:20px 16px}
    .hood-ic{width:40px;height:40px}
    .hood-status{grid-column:2;justify-self:start}
    .closing{padding:64px 16px}
    .closing-actions{flex-direction:column}
    .closing-actions .btn{width:100%}
  }
  @media(prefers-reduced-motion:reduce){.hcards,.wsq{transition:none}}
  /* ══ v5 · Discovery ══ */
  .cat-chips{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 28px}
  .res-tools{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap}
  .res-tools .tierf{margin:0}
  .sortf{position:relative;display:flex;align-items:center;gap:10px;margin-left:auto}
  .sortf label{font-size:.875rem;color:var(--muted)}
  .sortf select{appearance:none;-webkit-appearance:none;min-height:40px;padding:0 36px 0 14px;border:1px solid var(--fog);border-radius:var(--r-ctl);background:#fff;color:var(--ink);font:500 15px 'Outfit',sans-serif;cursor:pointer}
  .sortf select:focus-visible{outline:2px solid var(--rx);outline-offset:2px}
  .sortf svg{position:absolute;right:12px;pointer-events:none;color:var(--muted)}
  .empty{margin:0 0 32px;padding:28px;border-radius:var(--r-panel);background:#fff;border:1px solid var(--fog)}
  .empty h2{font-family:'Instrument Serif',serif;font-weight:400;font-size:1.9375rem;line-height:1.1;letter-spacing:-.015em;color:var(--ink);text-wrap:balance}
  .empty p{margin:10px 0 20px;font-size:1rem;line-height:1.6;color:#3E4F5D;max-width:62ch}
  .empty-actions{display:flex;gap:10px;flex-wrap:wrap}
  .glance{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:20px 24px 0;border:1px solid var(--fog);border-radius:14px;overflow:hidden}
  .glance > div{padding:12px 16px;min-width:0}
  .glance > div + div{border-left:1px solid var(--fog)}
  .glance dt{font-size:.8125rem;color:var(--muted);margin-bottom:2px}
  .glance dd{margin:0;font-size:.9375rem;font-weight:500;color:var(--ink);line-height:1.4;overflow-wrap:anywhere}
  .glance dd a{color:var(--rx-ink);font-variant-numeric:tabular-nums;text-decoration:underline;text-decoration-color:rgba(15,110,80,.35);text-underline-offset:3px}
  .glance-more{color:var(--muted);font-weight:400}
  @media(max-width:700px){
    .glance{grid-template-columns:minmax(0,1fr);margin:16px 16px 0}
    .glance > div{display:grid;grid-template-columns:72px minmax(0,1fr);gap:12px;align-items:baseline}
    .glance > div + div{border-left:none;border-top:1px solid var(--fog)}
    .glance dd a{display:inline-flex;align-items:center;min-height:32px}
    .empty{padding:20px 16px}
    .empty-actions .btn{flex:1 1 100%}
    .sortf select{min-height:44px}
  }
  .search-body .res-head{align-items:center;margin:0 0 16px;min-height:44px;flex-wrap:wrap}
  .search-body .res-head h2{font-family:'Instrument Serif',serif;font-weight:400;font-size:1.5625rem;letter-spacing:-.01em;color:var(--ink)}
  .res-head-r{display:flex;align-items:center;gap:16px;margin-left:auto}
  .res-head-r > span{font-size:.875rem;color:var(--muted)}
  .search-body .ai-note{font-size:.9375rem;margin:0 0 16px;max-width:72ch}
  @media(max-width:700px){.res-head-r > span{display:none}.search-body .res-head h2{font-size:1.375rem}}
  /* ══ v5 · Shared page body ══ */
  .pbody{max-width:1224px;margin:0 auto;padding:16px 32px 96px}
  .cm{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:48px;align-items:start}
  .cm-aside{display:flex;flex-direction:column;gap:16px;position:sticky;top:96px}
  .aside-panel{background:#fff;border:1px solid var(--fog);border-radius:var(--r-panel);padding:20px}
  .aside-panel h2{display:flex;align-items:center;gap:8px;font:600 1rem 'Outfit',sans-serif;color:var(--ink);margin:0 0 12px}
  .aside-panel h2 svg{color:var(--rx-ink)}
  .aside-panel p{font-size:.9375rem;line-height:1.55;color:#3E4F5D;margin:0 0 14px}
  .rules{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
  .rules li{position:relative;padding-left:18px;font-size:.9375rem;line-height:1.5;color:#3E4F5D}
  .rules li::before{content:"";position:absolute;left:2px;top:.6em;width:6px;height:6px;border-radius:50%;background:var(--rx)}
  .aside-links{list-style:none;padding:0;margin:0 -8px}
  .aside-links a,.aside-links button{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:44px;padding:0 8px;border:none;background:none;border-radius:8px;color:var(--ink);font:500 .9375rem 'Outfit',sans-serif;text-decoration:none;text-align:left;cursor:pointer}
  .aside-links svg{color:var(--muted);flex-shrink:0}
  @media(hover:hover){.aside-links a:hover,.aside-links button:hover{background:var(--mist)}}
  .aside-cta .btn{width:100%}
  .dash-sec{margin-top:56px}

  /* Community */
  .composer{display:flex;gap:14px;align-items:flex-start;background:#fff;border:1px solid var(--fog);border-radius:var(--r-panel);padding:16px;margin-bottom:24px}
  .composer-f{flex:1;min-width:0}
  .composer-r{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:10px}
  .composer-r small{font-size:.8125rem;color:var(--muted);line-height:1.45}
  .join-row{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;background:#fff;border:1px solid var(--fog);border-radius:var(--r-panel);padding:16px 20px;margin-bottom:24px}
  .join-row p{margin:0;font-size:1rem;color:#3E4F5D}
  .join-row b{color:var(--ink);font-weight:600}
  .feed-note{font-size:.875rem;color:var(--muted);margin:-12px 0 12px}
  .feed{list-style:none;padding:0;margin:0;background:#fff;border:1px solid var(--fog);border-radius:var(--r-panel)}
  .fpost{display:flex;gap:14px;padding:20px}
  .fpost + .fpost{border-top:1px solid var(--fog)}
  .pav2{width:40px;height:40px;border-radius:50%;background:var(--rx-tint);color:var(--rx-ink);font-size:.8125rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .pav-lg{width:48px;height:48px;font-size:.9375rem}
  .fpost-b{flex:1;min-width:0}
  .fpost-h{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .fpost-h b{font-weight:600;color:var(--ink);font-size:.9375rem}
  .fpost-h time{margin-left:auto;font-size:.8125rem;color:var(--muted)}
  .fpost-c{display:block;font-size:.8125rem;color:var(--muted);margin-top:1px}
  .fpost-b > p{font-size:1rem;line-height:1.65;color:#22313D;margin:10px 0 8px;max-width:68ch;text-wrap:pretty}
  .ftag{font-size:.75rem;font-weight:600;padding:2px 8px;border-radius:999px;background:var(--mist);color:#3E4F5D;border:1px solid var(--fog)}
  .ftag-success-story{background:var(--rx-tint);color:var(--rx-ink);border-color:#BFE0D2}
  .ftag-question{background:#EEF3F8;color:#264A6B;border-color:#D3DFEA}
  .fpost-a{display:flex;gap:4px;margin-left:-10px}
  .fact{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 10px;border:none;background:none;border-radius:8px;color:var(--muted);font:500 .875rem 'Outfit',sans-serif;font-variant-numeric:tabular-nums;cursor:pointer;transition:background-color .15s,color .15s}
  .fact.on{color:#B42318}
  .fact-static{cursor:default}
  @media(hover:hover){button.fact:hover{background:var(--mist);color:var(--ink)}button.fact.on:hover{color:#B42318}}
  .group-list{list-style:none;padding:0;margin:0;background:#fff;border:1px solid var(--fog);border-radius:var(--r-panel)}
  .group-list li{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:20px;align-items:center;padding:20px 24px}
  .group-list li + li{border-top:1px solid var(--fog)}
  .group-list h3{font-size:1.0625rem;font-weight:600;color:var(--ink);margin:0 0 2px}
  .group-list p{font-size:.9375rem;color:#3E4F5D;margin:0;line-height:1.5}
  .group-list .btn{min-width:124px}

  /* Dashboard */
  .signed-out{max-width:560px;margin:56px auto;text-align:left;background:#fff;border:1px solid var(--fog);border-radius:var(--r-obj);padding:32px}
  .signed-out h1{font-family:'Instrument Serif',serif;font-weight:400;font-size:2.4375rem;line-height:1.05;letter-spacing:-.02em;color:var(--ink);margin:20px 0 10px;text-wrap:balance}
  .signed-out p{font-size:1rem;line-height:1.6;color:#3E4F5D;margin:0 0 24px}
  .pbody .res-head h2{font-family:'Instrument Serif',serif;font-weight:400;font-size:1.5625rem;letter-spacing:-.01em;color:var(--ink)}
  .pbody .res-head{align-items:center;margin:0 0 16px}
  a.link-btn{text-decoration:none}
  .timeline{list-style:none;padding:0;margin:0;position:relative}
  .timeline li{display:grid;grid-template-columns:32px minmax(0,1fr) auto;gap:14px;align-items:center;min-height:56px;position:relative}
  .timeline li:not(:last-child)::after{content:"";position:absolute;left:15.5px;top:40px;bottom:-12px;width:1px;background:var(--fog)}
  .tl-ic{width:32px;height:32px;border-radius:50%;background:#fff;border:1px solid var(--fog);color:var(--rx-ink);display:flex;align-items:center;justify-content:center}
  .tl-t{font-size:1rem;color:var(--ink)}
  .timeline time{font-size:.875rem;color:var(--muted);white-space:nowrap}
  .acct{display:flex;align-items:center;gap:14px}
  .acct b{display:block;font-weight:600;color:var(--ink)}
  .acct small{display:block;font-size:.875rem;color:var(--muted);overflow-wrap:anywhere}

  /* About */
  .about-head h1{max-width:18ch;font-size:clamp(2.6rem,5.4vw,4.25rem);line-height:1}
  .about-head p{font-size:1.1875rem;max-width:56ch}
  .about{padding-top:32px}
  .ab-row{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:48px;padding:48px 0;border-top:1px solid var(--fog)}
  .ab-row > h2{font-family:'Instrument Serif',serif;font-weight:400;font-size:2rem;line-height:1.1;letter-spacing:-.015em;color:var(--ink);text-wrap:balance}
  .ab-copy p{font-size:1.0625rem;line-height:1.7;color:#3E4F5D;max-width:64ch;margin:0 0 16px}
  .ab-copy .ab-lead{font-family:'Instrument Serif',serif;font-size:1.75rem;line-height:1.3;color:var(--ink);letter-spacing:-.01em;margin-bottom:20px}
  .ab-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px}
  .ab-cols h3{font-size:1rem;font-weight:600;color:var(--ink);margin:0 0 12px}
  .ab-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px}
  .ab-list li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:12px;font-size:1rem;line-height:1.55;color:#3E4F5D}
  .ab-list svg{color:var(--rx);margin-top:3px}
  .ab-list.no svg{color:var(--muted)}
  .ab-values{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px 40px;margin:0}
  .ab-values dt{font-weight:600;font-size:1.0625rem;color:var(--ink);margin-bottom:6px}
  .ab-values dd{margin:0;font-size:1rem;line-height:1.6;color:#3E4F5D}
  .ab-goals li{font-size:1.0625rem}

  /* Cost estimate */
  .sim-panel{padding:32px}
  .sim-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-bottom:24px}
  .sim-fields .lbl{margin-bottom:0}
  .sim-hint{font-size:.875rem;color:var(--muted);margin:0 0 8px;line-height:1.4;min-height:2.8em}
  .money-inp{position:relative}
  .money-inp span{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:16px;pointer-events:none}
  .money-inp .inp{padding-left:28px;font-variant-numeric:tabular-nums;font-weight:500}
  .sim .rcards{margin-bottom:20px}
  .sim .rcards-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
  .sim-out{margin-top:32px;padding-top:28px;border-top:1px solid var(--fog)}
  .sim-h{font:600 1.0625rem 'Outfit',sans-serif;color:var(--ink);margin:0 0 14px}
  .months{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:6px}
  .mo{display:flex;flex-direction:column;align-items:center;gap:6px}
  .mo b{display:flex;align-items:center;justify-content:center;width:100%;min-height:44px;border-radius:8px;font-size:.8125rem;font-weight:600;text-align:center;line-height:1.1;padding:0 2px}
  .mo small{font-size:.75rem;color:var(--muted)}
  .mo-free b,.mo-sw.mo-free{background:var(--rx-tint);color:var(--rx-ink);box-shadow:inset 0 0 0 1px #BFE0D2}
  .mo-warn b,.mo-sw.mo-warn{background:#FEF6E7;color:#8A4B0B;box-shadow:inset 0 0 0 1px #F5D9A8}
  .mo-pay b,.mo-sw.mo-pay{background:#FDECEA;color:#B42318;box-shadow:inset 0 0 0 1px #F6C9C4}
  .mo-key{list-style:none;padding:0;margin:12px 0 0;display:flex;flex-wrap:wrap;gap:8px 20px}
  .mo-key li{display:flex;align-items:center;gap:8px;font-size:.875rem;color:var(--muted)}
  .mo-sw{width:14px;height:14px;border-radius:4px;display:inline-block}
  .sim-sum{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:28px 0 20px;border:1px solid var(--fog);border-radius:14px}
  .sim-sum > div{padding:18px 20px;min-width:0}
  .sim-sum > div + div{border-left:1px solid var(--fog)}
  .sim-sum dt{font-size:.875rem;color:var(--muted);line-height:1.4}
  .sim-sum dd{margin:6px 0;font-family:'Instrument Serif',serif;font-size:2.4375rem;line-height:1;letter-spacing:-.02em;color:var(--ink);font-variant-numeric:tabular-nums}
  .sim-sum dd.good{color:var(--rx-ink)}
  .sim-sum dd.bad{color:#B42318}
  .sim-sum dd.warn{color:#8A4B0B;font-size:2rem}
  .sim-sum dd.sim-note{font-family:'Outfit',sans-serif;font-size:.875rem;color:#3E4F5D;line-height:1.5;margin:0;letter-spacing:0}
  .note-ok,.note-warn{border-radius:12px;padding:14px 18px;font-size:.9375rem;line-height:1.6;margin-bottom:16px}
  .note-ok{background:var(--rx-tint);color:#0B4F3A;border:1px solid #BFE0D2}
  .note-warn{background:#FDECEA;color:#7A1A12;border:1px solid #F6C9C4}
  .note-ok b,.note-warn b{font-weight:600}
  .sim-more svg{transition:transform .2s var(--ease)}
  .tbl-wrap{margin-top:16px;overflow-x:auto;border:1px solid var(--fog);border-radius:12px}
  .tbl{width:100%;border-collapse:collapse;font-size:.875rem}
  .tbl th{text-align:left;font-weight:600;color:var(--muted);background:var(--mist);padding:10px 14px;border-bottom:1px solid var(--fog);white-space:nowrap}
  .tbl td{padding:10px 14px;border-bottom:1px solid var(--fog);color:var(--ink);font-variant-numeric:tabular-nums}
  .tbl tr:last-child td{border-bottom:none}
  .tbl td.bad{color:#B42318;font-weight:600}
  .tbl td svg{color:var(--rx);margin-left:6px;vertical-align:-2px}
  .letter-h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
  .letter-h h3{font:600 1.0625rem 'Outfit',sans-serif;color:var(--ink);margin:0}
  .letter-body{background:var(--mist);border:1px solid var(--fog);border-radius:12px;padding:20px 22px;font-family:'Instrument Serif',serif;font-size:1.125rem;line-height:1.65;color:#22313D;white-space:pre-wrap;max-width:72ch}
  .letter-note{font-size:.875rem;color:var(--muted);margin-top:12px}

  @media(max-width:1023px){
    .cm{grid-template-columns:minmax(0,1fr);gap:32px}
    .cm-aside{position:static}
    .ab-row{grid-template-columns:minmax(0,1fr);gap:20px}
  }
  @media(max-width:700px){
    .pbody{padding:8px 16px 56px}
    .composer{padding:14px}
    .composer-r{flex-direction:column;align-items:stretch}
    .join-row .btn{width:100%}
    .fpost{padding:16px;gap:12px}
    .pav2{width:36px;height:36px}
    .fact{min-height:44px}
    .group-list li{grid-template-columns:40px minmax(0,1fr);padding:16px;gap:14px}
    .group-list .btn{grid-column:1 / -1;width:100%}
    .signed-out{margin:24px 0;padding:24px 20px}
    .signed-out h1{font-size:2rem}
    .timeline li{grid-template-columns:32px minmax(0,1fr);row-gap:0;padding:6px 0}
    .timeline time{grid-column:2}
    .timeline li:not(:last-child)::after{top:44px}
    .about-head p{font-size:1.0625rem}
    .ab-row{padding:36px 0}
    .ab-row > h2{font-size:1.75rem}
    .ab-copy .ab-lead{font-size:1.4375rem}
    .ab-cols,.ab-values{grid-template-columns:minmax(0,1fr);gap:28px}
    .sim-panel{padding:20px 16px}
    .sim-fields{grid-template-columns:minmax(0,1fr);gap:16px}
    .sim-hint{min-height:0}
    .sim .rcards-grid{grid-template-columns:minmax(0,1fr)}
    .months{grid-template-columns:repeat(6,minmax(0,1fr));row-gap:12px}
    .sim-sum{grid-template-columns:minmax(0,1fr)}
    .sim-sum > div + div{border-left:none;border-top:1px solid var(--fog)}
    .sim .btn,.letter-h .btn{width:100%}
    .letter-h{flex-direction:column;align-items:stretch}
    .letter-body{padding:16px;font-size:1.0625rem}
  }
  .sim .q-legend{font:600 1.0625rem 'Outfit',sans-serif;letter-spacing:0;color:var(--ink);margin-bottom:4px}
  .sim .q-hint{font-size:.9375rem;margin-bottom:14px}
  .sim-hint{min-height:0;margin-bottom:10px}
  .sim-fields{align-items:end}
  @media(max-width:700px){.mo-w{display:none}.tbl th:nth-child(2),.tbl td:nth-child(2){display:none}.tbl th,.tbl td{padding:10px 12px}}
  /* ══ v5 · Sign in ══ */
  .au-wrap{min-height:calc(100vh - 72px);display:flex;align-items:center;justify-content:center;padding:48px 32px 96px}
  .au-card{width:100%;max-width:1000px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);background:#fff;border:1px solid var(--fog);border-radius:24px;overflow:hidden;box-shadow:var(--lift)}
  .au-side{background:var(--ink);color:#fff;padding:48px 44px;display:flex;flex-direction:column;justify-content:flex-end;position:relative;overflow:hidden;min-height:560px}
  .au-cards{position:absolute;inset:0 0 auto 0;height:300px}
  .au-c{position:absolute;width:270px;left:50%;top:58%}
  .au-c-0{transform:translate(-50%,-50%) translate(-34%,-34%) rotate(-9deg)}
  .au-c-1{transform:translate(-50%,-50%) translate(30%,-18%) rotate(7deg)}
  .au-c-2{transform:translate(-50%,-50%) translate(0,22%) rotate(-3deg);box-shadow:0 24px 48px -16px rgba(0,0,0,.5)}
  .au-c .ccard-price b{font-size:2rem}
  .au-side-h{position:relative;font-family:'Instrument Serif',serif;font-weight:400;font-size:2.4375rem;line-height:1.05;letter-spacing:-.02em;color:#fff;max-width:14ch;margin:0 0 20px;text-wrap:balance}
  .au-points{position:relative;list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
  .au-points li{display:flex;align-items:center;gap:10px;font-size:.9375rem;color:rgba(255,255,255,.8)}
  .au-points svg{color:#7FDDB7;flex-shrink:0}
  .au-form{padding:56px 52px;display:flex;flex-direction:column;justify-content:center}
  .au-h{font-family:'Instrument Serif',serif;font-weight:400;font-size:2.4375rem;line-height:1.05;letter-spacing:-.02em;color:var(--ink);margin:0 0 8px}
  .au-p{font-size:1rem;color:var(--muted);line-height:1.55;margin:0 0 28px}
  .au-google{width:100%;min-height:48px;gap:10px}
  .au-or{display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--muted);font-size:.875rem}
  .au-or::before,.au-or::after{content:"";flex:1;height:1px;background:var(--fog)}
  .au-fields{display:flex;flex-direction:column;gap:16px}
  .au-field{position:relative}
  .au-field .inp.has-r{padding-right:52px}
  .au-r{position:absolute;right:2px;top:50%;transform:translateY(-50%)}
  .au-eye{width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:none;background:none;border-radius:8px;color:var(--muted);cursor:pointer}
  @media(hover:hover){.au-eye:hover{color:var(--ink);background:var(--mist)}}
  .au-err{margin:0;font-size:.9375rem;color:var(--rose);line-height:1.5}
  .au-submit{width:100%;min-height:52px;font-size:16px;margin-top:4px}
  .au-switch{margin:24px 0 0;font-size:.9375rem;color:var(--muted)}
  .au-switch a{color:var(--rx-ink);font-weight:600;text-decoration:underline;text-decoration-color:rgba(15,110,80,.35);text-underline-offset:3px;display:inline-flex;align-items:center;min-height:44px}
  @media(max-width:860px){
    .au-card{grid-template-columns:minmax(0,1fr);max-width:520px}
    .au-side{display:none}
  }
  @media(max-width:700px){
    .au-wrap{padding:16px 16px 48px;align-items:flex-start;min-height:0}
    .au-card{border:none;box-shadow:none;background:transparent;border-radius:0}
    .au-form{padding:16px 0 0}
    .au-h{font-size:2.25rem}
  }
  .coach-1{grid-template-columns:minmax(0,1fr) 300px;gap:32px}
  .coach-1 .rcards-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
  .coach-1 .coach-fields{grid-template-columns:repeat(3,minmax(0,1fr))}
  @media(max-width:1180px){.coach-1 .rcards-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:1023px){.coach-1{grid-template-columns:minmax(0,1fr)}.coach-1 .cm-aside{display:none}}
  @media(max-width:700px){.coach-1 .rcards-grid,.coach-1 .coach-fields{grid-template-columns:minmax(0,1fr)}}
  .glance dd a{display:inline-flex;align-items:center;min-height:24px}
  .tbl-wrap:focus-visible{outline:2px solid var(--rx);outline-offset:2px}
  /* ══ v6 · Program detail ══ */
  .pd{--pd-x:28px;position:relative}
  .pd .pd-head{padding:28px var(--pd-x) 0}
  .pd .psp-why{margin:16px var(--pd-x) 0;padding:12px 14px;border-radius:12px;background:var(--rx-tint);color:#0B4F3A;font-size:.9375rem;line-height:1.55}
  .pd .glance{margin:20px var(--pd-x) 0}
  .pd-nav{position:sticky;top:0;z-index:3;display:flex;gap:4px;margin-top:24px;padding:8px calc(var(--pd-x) - 8px);background:rgba(255,255,255,.92);-webkit-backdrop-filter:saturate(1.6) blur(12px);backdrop-filter:saturate(1.6) blur(12px);border-top:1px solid var(--fog);border-bottom:1px solid var(--fog);overflow-x:auto;scrollbar-width:none}
  .pd-nav::-webkit-scrollbar{display:none}
  .pd-nav button{flex-shrink:0;min-height:36px;padding:0 12px;border:none;background:none;border-radius:999px;color:var(--muted);font:500 .875rem 'Outfit',sans-serif;cursor:pointer;transition:background-color .15s,color .15s}
  .pd-nav button.on{background:var(--ink);color:#fff}
  @media(hover:hover){.pd-nav button:not(.on):hover{background:var(--mist);color:var(--ink)}}
  .pd-sec{padding:32px var(--pd-x) 0;scroll-margin-top:56px}
  .pd-sec + .pd-sec{margin-top:32px;border-top:1px solid var(--fog)}
  .pd-sec h3{font-family:'Instrument Serif',serif;font-weight:400;font-size:1.5625rem;line-height:1.15;letter-spacing:-.01em;color:var(--ink);margin:0 0 14px}
  .pd-sec h3:focus{outline:none}
  .pd-sec-h{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:14px}
  .pd-sec-h h3{margin:0}
  .pd-price{display:flex;flex-direction:column;gap:2px;margin:0 0 12px}
  .pd-price small{font-size:.8125rem;color:var(--muted)}
  .pd-price span{display:flex;align-items:baseline;gap:4px}
  .pd-price b{font-family:'Instrument Serif',serif;font-weight:400;font-size:3.5rem;line-height:1;letter-spacing:-.02em;color:var(--rx-ink);font-variant-numeric:tabular-nums}
  .pd-price i{font-style:normal;font-size:1rem;color:var(--muted)}
  .pd-text{font-size:1rem;line-height:1.65;color:#22313D;max-width:64ch;margin:0;text-wrap:pretty}
  .pd-wait{color:var(--muted)}
  .pd-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
  .pd-actions:empty{display:none}
  .pd-fine{margin:14px 0 0;font-size:.8125rem;color:var(--muted);line-height:1.5}
  .mini-seg{display:inline-flex;gap:2px;padding:3px;background:var(--mist);border:1px solid var(--fog);border-radius:11px}
  .mini-seg button{min-height:34px;padding:0 12px;border:none;border-radius:8px;background:none;color:var(--muted);font:500 .875rem 'Outfit',sans-serif;cursor:pointer;transition:background-color .15s,color .15s,box-shadow .15s}
  .mini-seg button[aria-pressed="true"]{background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(9,29,46,.08),0 0 0 1px rgba(9,29,46,.05)}
  .pd-checks{list-style:none;padding:0;margin:0;display:grid;gap:10px}
  .pd-checks li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:10px;font-size:1rem;line-height:1.55;color:#22313D}
  .pd-checks svg{color:var(--rx);margin-top:4px}
  .pd-two{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 24px}
  .pd-bottom{margin:14px 0 0;padding:12px 14px;border-radius:12px;background:var(--rx-tint);color:#0B4F3A;font-size:.9375rem;line-height:1.55}
  .pd-bottom b{font-weight:600}
  .pd-conds{margin:16px 0 0;font-size:.875rem;line-height:1.6;color:var(--muted)}
  .pd-conds b{color:var(--ink);font-weight:600;margin-right:4px}
  .pd-steps{list-style:none;padding:0;margin:0}
  .pd-steps li{position:relative;display:grid;grid-template-columns:32px minmax(0,1fr);gap:14px;padding-bottom:18px}
  .pd-steps li:last-child{padding-bottom:0}
  .pd-steps li:not(:last-child)::before{content:"";position:absolute;left:15.25px;top:34px;bottom:2px;width:1.5px;background:var(--fog)}
  .pd-steps span{width:32px;height:32px;border-radius:50%;border:1.5px solid var(--rx);background:#fff;color:var(--rx-ink);font:600 .875rem 'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}
  .pd-steps p{margin:0;padding-top:5px;font-size:1rem;line-height:1.55;color:#22313D}
  .pd-h4{font:600 1rem 'Outfit',sans-serif;color:var(--ink);margin:28px 0 12px}
  .pd-faq{border-top:1px solid var(--fog)}
  .pd-faq-i{border-bottom:1px solid var(--fog)}
  .pd-faq-i h4{margin:0}
  .pd-faq-i button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:56px;padding:14px 0;border:none;background:none;text-align:left;color:var(--ink);font:500 1rem 'Outfit',sans-serif;cursor:pointer}
  @media(hover:hover){.pd-faq-i button:hover span{text-decoration:underline;text-decoration-color:var(--fog);text-underline-offset:4px}}
  .pd-faq-a{padding:0 32px 18px 0;font-size:1rem;line-height:1.65;color:#3E4F5D}
  .pd-appeal{padding-bottom:4px}
  .pd-deny{width:100%;display:grid;grid-template-columns:20px minmax(0,1fr) 18px;align-items:center;gap:12px;padding:14px 16px;border:1px solid var(--fog);border-radius:14px;background:#fff;text-align:left;cursor:pointer;transition:background-color .15s,border-color .15s}
  .pd-deny > svg:first-child{color:var(--rose)}
  .pd-deny b{display:block;font-weight:600;font-size:.9375rem;color:var(--ink)}
  .pd-deny small{display:block;font-size:.875rem;color:var(--muted);margin-top:1px}
  @media(hover:hover){.pd-deny:hover{background:var(--mist);border-color:#C9D5D1}}
  .pd-appeal-f{margin-top:16px}
  .pd-appeal-row{display:flex;gap:8px}
  .pd-appeal-row .inp{flex:1;min-width:0}
  .letter-out{margin-top:16px}
  .letter-out .letter-h h4{font:600 1rem 'Outfit',sans-serif;color:var(--ink);margin:0}
  .pd > .psp-dock{margin-top:32px}
  .psp-dock .bp{gap:10px}
  .dock-t{display:flex;flex-direction:column;align-items:center;line-height:1.15}
  .dock-t small{font-size:.8125rem;font-weight:500;margin-top:2px}
  .prow-amt{display:flex;align-items:baseline;gap:2px}
  .prow-price .prow-amt i{margin-top:0}
  .split-detail .pd-nav{top:0}
  @media(max-width:700px){
    .pd{--pd-x:16px}
    .pd .pd-head{padding:4px var(--pd-x) 0;gap:16px}
    .pd .pd-card{max-width:250px}
    .pd .pd-card .ccard-price b{font-size:2.25rem}
    .pd-nav{margin-top:20px}
    .pd-nav button{min-height:40px}
    .pd-sec{padding-top:28px}
    .pd-sec + .pd-sec{margin-top:28px}
    .pd-price b{font-size:3rem}
    .pd-two{grid-template-columns:minmax(0,1fr)}
    .pd-appeal-row{flex-direction:column}
    .pd-actions .btn{width:100%}
    .mini-seg{width:100%}
    .mini-seg button{flex:1;min-height:40px}
  }
  /* ══ v6 · Home and chrome ══ */
  @media(prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
  @media(min-width:701px){
    .nav{background:rgba(243,246,245,0);border-bottom-color:transparent;-webkit-backdrop-filter:none;backdrop-filter:none;transition:background-color .2s var(--ease),border-color .2s var(--ease)}
    .nav.is-scrolled{background:rgba(255,255,255,.86);border-bottom-color:var(--fog);-webkit-backdrop-filter:saturate(1.8) blur(14px);backdrop-filter:saturate(1.8) blur(14px)}
  }
  .makers{max-width:1160px;margin:72px auto 0;padding-top:28px;border-top:1px solid var(--fog);display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px 32px;align-items:baseline}
  .makers-k{font-size:.875rem;color:var(--muted);margin:0;white-space:nowrap}
  .makers-l{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:6px 28px}
  .makers-l li{font:600 1.0625rem 'Outfit',sans-serif;letter-spacing:-.01em;color:#5B6B78}
  .makers-n{grid-column:2;font-size:.8125rem;color:var(--muted);margin:4px 0 0}
  .how-steps li{display:flex;flex-direction:column}
  .vig{height:168px;justify-content:center;margin-bottom:28px;padding:16px;border-radius:16px;background:#fff;border:1px solid var(--fog);box-shadow:var(--lift);display:flex;flex-direction:column;gap:10px;overflow:hidden;font-family:'Outfit',sans-serif;user-select:none}
  .vig-field{display:flex;align-items:center;gap:8px;height:40px;padding:0 12px;border:1.5px solid var(--rx);border-radius:10px;box-shadow:0 0 0 3px rgba(19,128,94,.12);color:var(--muted);font-size:.9375rem}
  .vig-field span{color:var(--ink);font-weight:500;display:flex;align-items:center}
  .vig-caret{display:inline-block;width:1.5px;height:17px;background:var(--ink);margin-left:1px}
  @media(prefers-reduced-motion:no-preference){.vig-caret{animation:caret 1.1s steps(1) infinite}}
  @keyframes caret{50%{opacity:0}}
  .vig-opt{display:grid;grid-template-columns:32px minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px;border-radius:10px;background:var(--mist)}
  .vig-opt .hs-ic{width:32px;height:32px;border-radius:8px}
  .vig-t{display:flex;flex-direction:column;min-width:0}
  .vig-t b{font-weight:600;font-size:.9375rem;color:var(--ink)}
  .vig-t small{font-size:.75rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .vig-money{font-family:'Instrument Serif',serif;font-size:1.5rem;color:var(--rx-ink);line-height:1}
  .vig-money small{font-family:'Outfit',sans-serif;font-size:.75rem;color:var(--muted);margin-left:2px}
  .vig-q{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .vig-q small{font-size:.75rem;color:var(--muted);white-space:nowrap}
  .vig-bar{flex:1;max-width:120px;height:4px;border-radius:4px;background:var(--fog-2);overflow:hidden}
  .vig-bar i{display:block;width:66%;height:100%;background:var(--rx);border-radius:4px}
  .vig-legend{font-family:'Instrument Serif',serif;font-weight:400;font-size:1.1875rem;line-height:1.1;color:var(--ink)}
  .vig-radio{display:flex;align-items:center;justify-content:space-between;height:36px;padding:0 12px;border:1px solid var(--fog);border-radius:9px;font-size:.875rem;font-weight:600;color:var(--ink)}
  .vig-radio i{width:16px;height:16px;border-radius:50%;border:1.5px solid #9AA9B4}
  .vig-radio.on{border-color:var(--rx);background:var(--rx-tint);box-shadow:inset 0 0 0 1px var(--rx)}
  .vig-radio.on i{border-color:var(--rx);background:radial-gradient(circle,var(--rx) 0 3.5px,#fff 4px)}
  .vig-check{display:flex;align-items:center;gap:10px;font-size:.875rem;color:var(--ink)}
  .vig-check i{width:18px;height:18px;border-radius:5px;border:1.5px solid #9AA9B4;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff}
  .vig-check.on i{background:var(--rx);border-color:var(--rx)}
  .vig-check.on span{color:var(--muted);text-decoration:line-through;text-decoration-color:rgba(91,107,120,.5)}
  .cat-chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 48px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 48px),transparent);padding-right:48px}
  .cat-chips::-webkit-scrollbar{display:none}
  .cat-chips .chip{flex-shrink:0}
  @media(max-width:1023px){.how-steps li{display:grid;grid-template-columns:minmax(0,1fr)}.vig{max-width:420px}}
  @media(max-width:700px){
    .makers{margin-top:40px;padding-top:20px;grid-template-columns:minmax(0,1fr);gap:12px}
    .makers-k{white-space:normal}
    .makers-l{gap:4px 18px}
    .makers-l li{font-size:.9375rem}
    .makers-n{grid-column:1}
    .vig{height:auto;min-height:150px;margin-bottom:20px}
    .cat-chips{margin-inline:-16px;padding-left:16px;-webkit-mask-image:none;mask-image:none;padding-right:16px}
  }
  .ptier5{color:#264A6B}
  .ptier5::before{background:#264A6B}
  .hm-h-sm{margin:40px 0 14px}
  .brief{align-items:start}
  .brief-col{display:flex;flex-direction:column;gap:16px;min-width:0}
  .brief-sec:first-child{grid-row:auto}
  @media(max-width:700px){.sortf label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.sortf select{min-width:0}}
  @media(max-width:374px){.seg button svg{display:none}.seg button{font-size:14px}}
  /* ══ v7 · Phone polish ══ */
  .nav-r{margin-left:auto}
  a.btn{text-decoration:none}
  @media(max-width:700px){
    .hcards{height:300px;max-width:360px;margin:8px auto 0}
    .hc{width:min(84%,300px);top:52%}
    .hc-0{transform:translate(-50%,-50%) translateY(-48%) scale(.84);z-index:1}
    .hc-1{transform:translate(-50%,-50%) translateY(-24%) scale(.92);z-index:2}
    .hc-2{transform:translate(-50%,-50%) translateY(10%);z-index:3}
    .hc-0 .ccard-foot,.hc-1 .ccard-foot{visibility:hidden}
    .hero-quick,.cat-chips{-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 40px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 40px),transparent)}
    .s-sticky{background:var(--mist)}
    .pghead.is-searched p{display:none}
    .pghead.is-searched h1{font-size:2rem;margin-bottom:16px}
    .how-steps{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -16px;padding:4px 16px 12px;border-top:none;scrollbar-width:none;scroll-padding-inline:16px}
    .how-steps::-webkit-scrollbar{display:none}
    .how-steps li,.how-steps li + li{flex:0 0 86%;scroll-snap-align:start;padding:0;border:none;display:flex;flex-direction:column}
    .how-steps .vig{max-width:none;height:172px;margin-bottom:18px}
    .how-steps:focus-visible{outline:2px solid var(--rx);outline-offset:-2px;border-radius:12px}
  }
  @media(min-width:701px){.how-steps:focus{outline:none}}
  a,button,input,select,textarea,label,[role="option"]{touch-action:manipulation}
  a,button,label,[role="option"]{-webkit-tap-highlight-color:transparent}
  /* ══ v8 · Desktop upgrade ══ */
  .ccard::before{content:none}
  .ccard-gl{position:absolute;inset:0;width:100%;height:100%;z-index:-1;fill:none;stroke:currentColor;stroke-width:.55;opacity:.2;pointer-events:none}
  .ccard-sage .ccard-gl{opacity:.16}
  .ccard::after{background:radial-gradient(140% 90% at var(--mx,18%) var(--my,0%),rgba(255,255,255,.16),rgba(255,255,255,0) 58%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12),inset 0 1px 0 rgba(255,255,255,.18)}
  .ccard-sage::after{background:radial-gradient(140% 90% at var(--mx,18%) var(--my,0%),rgba(255,255,255,.55),rgba(255,255,255,0) 58%);box-shadow:inset 0 0 0 1px rgba(9,29,46,.06),inset 0 1px 0 rgba(255,255,255,.7)}
  @media(min-width:1024px){
    .hero4{padding-top:96px;padding-bottom:88px}
    .hcards{height:480px}
    .hc{width:min(100%,420px)}
    .hc .ccard-price b{font-size:3.25rem}
    .hc .ccard{padding:22px 24px}
  }
  .hc{transition:transform .5s var(--ease)}
  /* Condition tiles: objects with a real lowest price */
  .cats{gap:12px}
  .cat{display:flex;flex-direction:column;align-items:stretch;gap:18px;min-height:0;padding:18px 18px 16px;border-radius:16px;background:#fff;border:1px solid var(--fog);transition:border-color .15s var(--ease),box-shadow .2s var(--ease),transform .2s var(--ease)}
  @media(hover:hover){.cat:hover{background:#fff;border-color:#C2D3CD;box-shadow:var(--lift);transform:translateY(-2px)}}
  .cat-ic{width:40px;height:40px;border-radius:11px}
  .cat{gap:14px}
  .cat-share{display:flex;flex-direction:column;gap:6px;padding-top:12px;border-top:1px solid var(--fog-2)}
  .cat-bar{display:block;height:4px;border-radius:4px;background:var(--fog-2);overflow:hidden}
  .cat-bar i{display:block;height:100%;border-radius:4px;background:var(--rx)}
  .cat-share small{font-size:.8125rem;color:var(--rx-ink);font-weight:500;font-variant-numeric:tabular-nums}
  .cat-t b{font-size:1rem}
  /* Caregiver on sage, checklist raised */
  .cg{background:var(--card-sage);border-top:none;border-bottom:none}
  .cg-p{color:#33464F}
  .cg-list{background:#fff;border:none;border-radius:20px;box-shadow:var(--lift-lg);padding:8px 4px}
  .cg-list li{padding:16px 20px;font-size:1rem}
  .cg-list li + li{border-top:1px solid var(--fog-2)}
  .cg-list svg{color:var(--rx)}
  /* Closing band: deep teal with the guilloche motif at full scale */
  .closing{position:relative;overflow:hidden;background:var(--card-teal);border-top:none;color:#fff}
  .closing-art{position:absolute;width:760px;height:760px;right:-300px;top:50%;transform:translateY(-50%);fill:none;stroke:#fff;stroke-width:.6;opacity:.14;pointer-events:none}
  .closing-in{position:relative}
  .closing-h{color:#fff}
  .closing-in > p{color:rgba(255,255,255,.78)}
  .closing .btn.bp{background:#fff;border-color:#fff;color:var(--card-teal)}
  .closing .btn.bo{background:transparent;border-color:rgba(255,255,255,.4);color:#fff}
  @media(hover:hover){.closing .btn.bp:hover:not(:disabled){background:var(--rx-tint);border-color:var(--rx-tint)}.closing .btn.bo:hover{background:rgba(255,255,255,.08);border-color:#fff}}
  .closing .btn:focus-visible{outline-color:#fff}
  @media(max-width:700px){
    .cat{flex-direction:row;align-items:center;gap:10px;padding:12px}
    .cat-share{display:none}
    .cat-ic{width:36px;height:36px}
    .cg-list li{padding:14px 16px}
    .closing-art{width:520px;height:520px;right:-240px;top:auto;bottom:-260px;transform:none}
  }
  @media(prefers-reduced-motion:reduce){.cat,.hc{transition:none}}
  .au-side{justify-content:flex-start}
  .au-side-h{margin-top:auto}
  .au-cards{position:relative;inset:auto;height:330px;flex-shrink:0;margin:-8px -12px 24px}
  .au-c{top:50%}
  .au-art{position:absolute;width:620px;height:620px;left:-200px;bottom:-330px;fill:none;stroke:#fff;stroke-width:.6;opacity:.09;pointer-events:none}
  .pghead{position:relative;overflow:hidden}
  .pghead-in,.pghead > div{position:relative}
  /* ══ v9 · Navigation ══ */
  @media(min-width:701px){
    .nav{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:24px}
    .nav-logo{justify-self:start}
    .nav-r{justify-self:end;margin-left:0}
    .nav-track{position:relative;display:flex;padding:4px;border-radius:999px;background:rgba(9,29,46,.045);box-shadow:inset 0 0 0 1px rgba(9,29,46,.05)}
    .nav.is-scrolled .nav-track{background:rgba(9,29,46,.04)}
    .nav-links{position:relative;z-index:1;flex:none;gap:2px}
    .nav-links li{display:block !important}
    .nl{min-height:36px;padding:0 14px;border-radius:999px;font:500 14.5px 'Outfit',sans-serif;color:#4A5A68;transition:color .2s var(--ease),background-color .15s}
    .nl.on{background:transparent;color:var(--ink)}
    @media(hover:hover){.nl:hover{background:transparent;color:var(--ink)}}
    .nav-ind{position:absolute;left:0;top:4px;bottom:4px;border-radius:999px;background:#fff;box-shadow:0 1px 2px rgba(9,29,46,.08),0 4px 12px -4px rgba(9,29,46,.14),0 0 0 1px rgba(9,29,46,.04);transition:transform .38s var(--ease),width .38s var(--ease);pointer-events:none}
  }
  @media(min-width:701px) and (max-width:1100px){.nl{padding:0 10px;font-size:13.5px}.nav{gap:12px}}
  @media(min-width:701px) and (max-width:900px){.nav-logo span{display:none}}
  @media(prefers-reduced-motion:reduce){.nav-ind{transition:none}}
  /* ══ v9 · Live hero card ══ */
  .hcards-wrap{isolation:isolate}
  .hero-art{position:absolute;z-index:-1;width:620px;height:620px;left:50%;top:50%;transform:translate(-50%,-50%);fill:none;stroke:var(--rx-ink);stroke-width:.6;opacity:.11;pointer-events:none;-webkit-mask-image:radial-gradient(closest-side,#000 55%,transparent);mask-image:radial-gradient(closest-side,#000 55%,transparent)}
  @media(prefers-reduced-motion:no-preference){
    .hc-live{animation:hcLive .48s var(--ease) both}
    @keyframes hcLive{from{opacity:0;transform:translate(-50%,-50%) translate(6%,46%) rotate(2deg)}}
  }
  @media(max-width:700px){
    .hero-art{display:none}
    @media(prefers-reduced-motion:no-preference){.hc-live{animation-name:hcLiveM}@keyframes hcLiveM{from{opacity:0;transform:translate(-50%,-50%) translateY(40%)}}}
  }
  .nav-r .btn{white-space:nowrap}
  @media(min-width:701px) and (max-width:900px){.nav-r .bp{display:none}}
  /* ══ v10 · On the call ══ */
  .callbar{position:sticky;top:76px;z-index:20;display:flex;align-items:center;gap:20px;flex-wrap:wrap;padding:14px 16px 14px 20px;margin-bottom:20px;border-radius:18px;background:var(--ink);color:#fff;box-shadow:var(--lift-lg)}
  .callbar-id{display:flex;align-items:center;gap:12px;min-width:0}
  .callbar-id small{display:block;font-size:.8125rem;color:rgba(255,255,255,.66)}
  .callbar-id b{display:block;font-family:'Instrument Serif',serif;font-weight:400;font-size:1.5rem;line-height:1.1;letter-spacing:-.01em}
  .callbar-dot{width:10px;height:10px;border-radius:50%;background:#7FDDB7;box-shadow:0 0 0 4px rgba(127,221,183,.18);flex-shrink:0}
  @media(prefers-reduced-motion:no-preference){.callbar-dot{animation:pulseDot 1.8s ease-in-out infinite}}
  @keyframes pulseDot{50%{box-shadow:0 0 0 8px rgba(127,221,183,0)}}
  .callbar-phone{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 4px;color:#fff;font-size:1.0625rem;font-weight:600;text-decoration:none;font-variant-numeric:tabular-nums}
  @media(hover:hover){.callbar-phone:hover{text-decoration:underline;text-underline-offset:4px}}
  .callbar-hours{font-size:.875rem;color:rgba(255,255,255,.7)}
  .callbar-time{font-family:'Instrument Serif',serif;font-size:1.75rem;line-height:1;font-variant-numeric:tabular-nums;color:#fff;margin-left:auto}
  .callbar-r{display:flex;gap:8px}
  .callbar .btn.bo{background:transparent;border-color:rgba(255,255,255,.35);color:#fff}
  .callbar .btn.bp{background:#fff;border-color:#fff;color:var(--ink)}
  @media(hover:hover){.callbar .btn.bo:hover{background:rgba(255,255,255,.08)}.callbar .btn.bp:hover:not(:disabled){background:var(--rx-tint);border-color:var(--rx-tint)}}
  .callbar .btn:focus-visible,.callbar-phone:focus-visible{outline-color:#fff}
  .oncall-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px;align-items:start}
  .oncall-main{display:flex;flex-direction:column;gap:16px;padding:28px}
  .oncall-h{font:600 1.0625rem 'Outfit',sans-serif;color:var(--ink);margin:0}
  .oncall-chips{display:flex;flex-wrap:wrap;gap:8px}
  .oncall-chips .chip{min-height:40px;text-align:left;white-space:normal;line-height:1.3;padding:8px 14px}
  .oncall-empty{margin:0;padding:24px;border:1.5px dashed var(--fog);border-radius:14px;font-size:1rem;line-height:1.6;color:var(--muted);text-align:center}
  .say-list{display:flex;flex-direction:column;gap:12px;max-height:56vh;overflow-y:auto;overscroll-behavior:contain;padding:2px}
  .say{padding:18px 20px;border-radius:16px;background:var(--mist);border:1px solid var(--fog)}
  .say.latest{background:#fff;border-color:var(--rx);box-shadow:0 0 0 3px rgba(19,128,94,.1)}
  .say-q{margin:0 0 10px;font-size:.9375rem;color:var(--muted)}
  .say-k{display:block;font-size:.8125rem;font-weight:600;color:var(--rx-ink);margin-bottom:4px}
  .say-a{margin:0;font-size:1.3125rem;line-height:1.5;color:var(--ink);white-space:pre-wrap;text-wrap:pretty}
  .say:not(.latest) .say-a{font-size:1.0625rem;color:#33464F}
  .say-wait{margin:0;color:var(--muted)}
  .ask-row{display:flex;gap:10px;align-items:stretch}
  .ask-row .inp{flex:1;min-width:0;resize:none}
  .ask-row .btn{align-self:stretch;min-height:auto}
  .oncall-aside{display:flex;flex-direction:column;gap:20px;position:sticky;top:176px}
  .oncall-aside .panel{display:flex;flex-direction:column;gap:12px;padding:24px}
  .oncall-aside .panel-p{margin:0}
  .ready{margin:0;display:grid;gap:0}
  .ready > div{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-top:1px solid var(--fog-2)}
  .ready > div:first-child{border-top:none;padding-top:4px}
  .ready dt{font-size:.875rem;color:var(--muted)}
  .ready dd{margin:0;font-size:1.0625rem;font-weight:600;color:var(--ink);text-align:right}
  .verdict-safe{background:var(--rx-tint);border-color:#9FD1BC}
  .verdict-safe p{color:#0B4F3A}
  .verdict-caution{background:#FEF6E7;border-color:#F0C98A}
  .verdict-caution p{color:#7A4209}
  .verdict-risk{background:#FDECEA;border-color:#F0B4AD}
  .verdict-risk p{color:#8E1B12}
  @media(max-width:1023px){.oncall-grid{grid-template-columns:minmax(0,1fr)}.oncall-aside{position:static}}
  @media(max-width:700px){
    .callbar{top:calc(56px + env(safe-area-inset-top) + 8px);gap:10px 14px;padding:12px 14px;border-radius:16px}
    .callbar-id b{font-size:1.25rem}
    .callbar-hours{display:none}
    .callbar-time{font-size:1.375rem}
    .callbar-r{width:100%}
    .callbar-r .btn{flex:1}
    .oncall-main{padding:20px 16px}
    .ask-row{flex-direction:column}
    .say-a{font-size:1.1875rem}
  }
  .story-facts dd a{color:#A9E8CF;text-decoration:underline;text-decoration-color:rgba(169,232,207,.45);text-underline-offset:3px;white-space:nowrap}
  @media(hover:hover){.story-facts dd a:hover{color:#fff}}
  .story-facts dd a:focus-visible{outline-color:#fff}
  .ft-mail{display:inline-flex;align-items:center;min-height:44px;margin-top:8px;color:#fff;font-weight:600;text-decoration:underline;text-decoration-color:rgba(255,255,255,.35);text-underline-offset:4px}
  .oncall-chips .chip.asked{background:var(--rx-tint);border-color:#BFE0D2;color:var(--rx-ink);gap:6px}
  @media(max-width:700px){.ask-row .btn{min-height:50px;align-self:auto}}
  .ms-t{flex:1;min-width:0}
  .f4-panel{margin-bottom:20px}
  .f4-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:16px}
  .f4-denial{margin-bottom:16px}
  .f4-err{margin:0 0 12px}
  .f4-wait{display:flex;flex-direction:column;align-items:center;gap:12px;padding:32px 0;color:var(--muted);font-size:.9375rem}
  .f4-wait .dots{display:inline-flex}
  @media(max-width:700px){.f4-grid{grid-template-columns:minmax(0,1fr)}}
  .skel-row{cursor:default}
  .skel-row .skel{display:block;border-radius:8px}
  .sk-name{width:62%;height:26px}
  .sk-line{width:84%;height:14px;margin-top:6px}
  .sk-price{width:64px;height:40px}
  .sk-meta{width:140px;height:14px}
  .skel-detail{display:flex;flex-direction:column;gap:14px;padding:28px;max-height:none}
  .skel-detail .skel{display:block;border-radius:10px}
  .sk-card{width:300px;max-width:100%;aspect-ratio:1.586;border-radius:20px}
  .sk-title{width:60%;height:34px}
  .sk-block{height:72px;border-radius:14px}
  .sk-short{width:70%}
  @media(max-width:700px){.oncall-chips .chip{min-height:44px}}
  .story-facts dd a{display:inline-block;padding:12px 0;margin:-12px 0}
  .skip{min-height:44px;display:inline-flex;align-items:center}
  .callbar.ended .callbar-dot{background:rgba(255,255,255,.45);box-shadow:none;animation:none}
  .callbar.ended .callbar-time{color:rgba(255,255,255,.75)}
  .outcome{padding:24px 28px}
  .outcome legend{float:left;width:100%;padding:0;margin:0 0 14px}
  .outcome legend + *{clear:both}
  /* ══ v11 · Tablets (iPad Pro 13, Surface Pro 10) ══ */
  /* Single column (Surface Pro portrait, 960px): keep the rotated back card clear of the checklist above */
  @media(min-width:701px) and (max-width:1023px){
    .hcards-wrap{padding-top:64px}
    .hcards{margin-inline:auto}
  }
  /* Narrow two-column (iPad Pro portrait, 1032px): smaller, tighter fan that stays inside its column */
  @media(min-width:1024px) and (max-width:1279px){
    .hero4-in{gap:40px}
    .hcards{height:420px}
    .hc{width:min(86%,330px)}
    .hc-0{transform:translate(-50%,-50%) translate(-16%,-38%) rotate(-8deg)}
    .hc-1{transform:translate(-50%,-50%) translate(16%,-12%) rotate(7deg)}
    .hc .ccard-price b{font-size:2.5rem}
  }
  /* Touchscreens wider than a phone: 44px minimum for every tap target */
  @media(pointer:coarse) and (min-width:701px){
    .nl,.nav-r .btn,.hero-quick button,.chip,.oncall-chips .chip,.seg button,.pd-nav button,.mini-seg button,.fact,.sortf select{min-height:44px}
    .nl,.pd-nav button,.mini-seg button,.fact{display:inline-flex;align-items:center}
    .ft li a{display:inline-flex;align-items:center;min-height:44px}
    dd a[href^="tel:"]{display:inline-flex;align-items:center;min-height:44px}
  }
`;


// Pulls the leading dollar amount out of a program's cost note so the card can lead with it.
// Returns null when the note doesn't start with a price (the full note is always shown below).
function priceHeadline(note) {
  if (/^free\b/i.test(note)) return { label: "Assistance available", value: "Free", unit: "" };
  const m = note.match(/^(as low as\s+)?(\$[\d,]+(?:\s*(?:to|-)\s*\$[\d,]+)?)/i);
  if (!m) return null;
  const unit = (note.slice(m[0].length, m[0].length + 32).match(/(?:\/|per\s+)(month|dose|injection|infusion|treatment|prescription|administration)/i) || [])[1];
  return { label: m[1] ? "As low as" : "You could pay", value: m[2].replace(/\s*-\s*/, "–"), unit: unit ? `/${unit.toLowerCase()}` : "" };
}

// Lowest listed monthly figure, for sorting. Free counts as $0; programs without a listed price sort last.
function priceSortValue(p) {
  const h = priceHeadline(p.costNote);
  if (!h) return Infinity;
  if (h.value === "Free") return 0;
  return Number((h.value.match(/\$([\d,]+)/) || [])[1]?.replace(/,/g, "")) || 0;
}

function scoreTone(score) {
  if (score >= 85) return { c: "#1d5c43", bg: "#E3F4EC", b: "#A7DCC4", label: "Strong match" };
  if (score >= 65) return { c: "var(--teal-d)", bg: "var(--sky)", b: "var(--border)", label: "Good match" };
  if (score >= 40) return { c: "#8a4b0b", bg: "#FEF6E7", b: "#F5D9A8", label: "Possible match" };
  return { c: "var(--muted)", bg: "#F1F5F4", b: "var(--border)", label: "Low match" };
}

function ScoreRing({ score }) {
  const r = 10, c = 2 * Math.PI * r;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r={r} fill="#fff" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
      <circle cx="13" cy="13" r={r} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 13 13)" />
    </svg>
  );
}

// The full program, shown in the bottom sheet on phones and the right-hand pane on wide screens.
function PSPDetailCard({ psp, matchScore, matchReason }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealDenial, setAppealDenial] = useState("");
  const [appealLetter, setAppealLetter] = useState("");
  const [appealLoading, setAppealLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const showPlain = async (on) => {
    if (!on) { setTranslation(null); return; }
    if (translation || translating) return;
    setTranslating(true);
    const result = await aiTranslate(psp);
    setTranslation(result); setTranslating(false);
  };
  const plainOn = Boolean(translation) || translating;
  const handleAppeal = async () => {
    if (!appealDenial.trim()) return;
    setAppealLoading(true); setAppealLetter("");
    const letter = await aiAppealLetter(psp.drugName, psp.programName, appealDenial, psp.conditions[0], "my insurance");
    setAppealLetter(letter); setAppealLoading(false);
  };
  const copyLetter = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(appealLetter).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  const tone = matchScore === undefined ? null : scoreTone(matchScore);
  const tel = psp.phone ? psp.phone.replace(/[^\d+]/g, "") : "";
  const id = `pd-${psp.id}`;
  const sections = [["cost", "Cost"], ["qualify", "Who qualifies"], ["enroll", "How to enroll"], ...(psp.faqs?.length ? [["faq", "Questions"]] : [])];
  const jump = (key) => {
    const el = document.getElementById(`${id}-${key}`);
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    el.querySelector("h3")?.focus({ preventScroll: true });
  };
  const host = (() => { try { return new URL(psp.enrollmentUrl).hostname.replace(/^www\./, ""); } catch { return ""; } })();
  const artRef = useRef(null);
  const [current, setCurrent] = useState("cost");
  // Highlight the section in view inside whichever pane scrolls (the sheet on phones, the detail pane on desktop).
  useEffect(() => {
    const art = artRef.current; if (!art || !("IntersectionObserver" in window)) return;
    const root = art.closest(".psheet-body, .split-detail");
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) setCurrent(en.target.dataset.sec); });
    }, { root, rootMargin: "-80px 0px -60% 0px" });
    art.querySelectorAll("[data-sec]").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <article className="pd" ref={artRef}>
      <header className="pd-head">
        <CopayCard psp={psp} className="pd-card" />
        <div className="pd-id">
          <h2 className="psp-drug" id={`psp-title-${psp.id}`} translate="no">{psp.drugName}</h2>
          <p className="psp-sub"><b translate="no">{psp.programName}</b> from {psp.manufacturer}</p>
          <p className="pd-meta"><span className={`ptier ptier${psp.tier}`}>Tier {psp.tier} specialty</span><span>{psp.specialty}</span></p>
          {tone && <span className="score" style={{ color: tone.c, background: tone.bg, borderColor: tone.b }}><ScoreRing score={matchScore} />{matchScore}% {tone.label.toLowerCase()}</span>}
        </div>
      </header>
      {matchReason && <p className="psp-why"><b>Why this score:</b> {matchReason}</p>}
      <dl className="glance" aria-label="At a glance">
        <div><dt>Phone</dt><dd>{tel ? <a href={`tel:${tel}`}>{psp.phone}</a> : "See website"}</dd></div>
        <div><dt>Hours</dt><dd>{psp.hours ? psp.hours.replace(/(\w)-(\w)/g, "$1–$2") : "See website"}</dd></div>
        <div><dt>Treats</dt><dd>{psp.conditions.slice(0, 2).join(", ")}{psp.conditions.length > 2 && <span className="glance-more"> +{psp.conditions.length - 2} more</span>}</dd></div>
      </dl>

      <nav className="pd-nav" aria-label="On this page">
        {sections.map(([k, l]) => <button key={k} type="button" className={current === k ? "on" : ""} aria-current={current === k ? "true" : undefined} onClick={() => jump(k)}>{l}</button>)}
      </nav>

      <section className="pd-sec" id={`${id}-cost`} data-sec="cost" aria-labelledby={`${id}-cost-h`}>
        <h3 id={`${id}-cost-h`} tabIndex={-1}>What you could pay</h3>
        <p className="pd-text">{psp.costNote}</p>
        <div className="pd-actions">
          {psp.copayUrl && <a href={psp.copayUrl} target="_blank" rel="noopener noreferrer" className="btn bo"><CreditCard size={16} aria-hidden="true" />Get the copay card<ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}
        </div>
        <p className="pd-fine">Set by the program, not by CureAid. Confirm current terms when you enroll.</p>
      </section>

      <section className="pd-sec" id={`${id}-qualify`} data-sec="qualify" aria-labelledby={`${id}-qualify-h`}>
        <div className="pd-sec-h">
          <h3 id={`${id}-qualify-h`} tabIndex={-1}>Who qualifies</h3>
          <div className="mini-seg" role="group" aria-label="Eligibility wording">
            <button type="button" aria-pressed={!plainOn} onClick={() => showPlain(false)}>Program’s wording</button>
            <button type="button" aria-pressed={plainOn} onClick={() => showPlain(true)}>Plain English</button>
          </div>
        </div>
        <div aria-live="polite">
          {translating ? <p className="pd-text pd-wait">Rewriting in plain English…</p> : translation ? (
            <div className="pd-plain">
              <ul className="pd-checks">{translation.bullets.map((b, i) => <li key={i}><Check size={16} aria-hidden="true" />{b}</li>)}</ul>
              {translation.bottomLine && <p className="pd-bottom"><b>Bottom line:</b> {translation.bottomLine}</p>}
            </div>
          ) : <p className="pd-text">{psp.eligibility}</p>}
        </div>
        <p className="pd-conds"><b>Approved for</b> {psp.conditions.join(", ")}</p>
      </section>

      <section className="pd-sec" id={`${id}-enroll`} data-sec="enroll" aria-labelledby={`${id}-enroll-h`}>
        <h3 id={`${id}-enroll-h`} tabIndex={-1}>How to enroll</h3>
        <ol className="pd-steps">
          {psp.enrollmentSteps.map((step, i) => <li key={i}><span aria-hidden="true">{i + 1}</span><p>{step}</p></li>)}
        </ol>
        {psp.supportServices?.length > 0 && (
          <>
            <h4 className="pd-h4">The program also offers</h4>
            <ul className="pd-checks pd-two">{psp.supportServices.map((s, i) => <li key={i}><Check size={16} aria-hidden="true" />{s}</li>)}</ul>
          </>
        )}
      </section>

      {psp.faqs?.length > 0 && (
        <section className="pd-sec" id={`${id}-faq`} data-sec="faq" aria-labelledby={`${id}-faq-h`}>
          <h3 id={`${id}-faq-h`} tabIndex={-1}>Common questions</h3>
          <div className="pd-faq">
            {psp.faqs.map((faq, i) => (
              <div key={i} className="pd-faq-i">
                <h4>
                  <button type="button" aria-expanded={openFaq === i} aria-controls={`${id}-faq-${i}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{faq.q}</span><ChevronDown size={18} className={`faq-chevron${openFaq === i ? " open" : ""}`} aria-hidden="true" />
                  </button>
                </h4>
                <div id={`${id}-faq-${i}`} className="pd-faq-a" hidden={openFaq !== i}>{faq.a}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="pd-sec pd-appeal" aria-label="Insurance denial">
        <button type="button" className="pd-deny" aria-expanded={showAppeal} aria-controls={`${id}-appeal`} onClick={() => setShowAppeal(!showAppeal)}>
          <ShieldAlert size={18} aria-hidden="true" />
          <span><b>Insurance denied it?</b><small>Draft an appeal letter for your doctor to review</small></span>
          <ChevronDown size={18} className={`faq-chevron${showAppeal ? " open" : ""}`} aria-hidden="true" />
        </button>
        {showAppeal && (
          <div className="pd-appeal-f" id={`${id}-appeal`}>
            <label className="lbl" htmlFor={`${id}-reason`}>Why did your insurance deny it?</label>
            <div className="pd-appeal-row">
              <input id={`${id}-reason`} name="denial-reason" autoComplete="off" className="inp" placeholder="e.g. Step therapy required…" value={appealDenial} onChange={e => setAppealDenial(e.target.value)} />
              <button type="button" className="btn bp" onClick={() => appealDenial.trim() ? handleAppeal() : document.getElementById(`${id}-reason`)?.focus()} disabled={appealLoading}>{appealLoading ? "Writing letter…" : "Write my letter"}</button>
            </div>
            {appealLetter && (
              <div className="letter-out">
                <div className="letter-h">
                  <h4>Your appeal letter</h4>
                  <button type="button" className="btn bo" onClick={copyLetter}>{copied ? <><Check size={16} aria-hidden="true" />Copied</> : <><Copy size={16} aria-hidden="true" />Copy letter</>}</button>
                </div>
                <div className="letter-body">{appealLetter}</div>
                <p className="letter-note">Review with your doctor before submitting.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="psp-dock">
        {tel && <a href={`tel:${tel}`} className="btn bo"><Phone size={17} aria-hidden="true" /> Call</a>}
        <a href={psp.enrollmentUrl} target="_blank" rel="noopener noreferrer" className="btn bp">
          <span className="dock-t">Start enrollment{host && <small>on {host}</small>}</span>
          <ExternalLink size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
}

// True below the phone breakpoint. Phones get the list-and-sheet layout; wider screens keep full cards.
function useIsMobile(query = "(max-width: 700px)") {
  return useSyncExternalStore(
    (onChange) => { const mq = window.matchMedia(query); mq.addEventListener("change", onChange); return () => mq.removeEventListener("change", onChange); },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

// Compact, scannable result row: what it is on the left, what you'd pay on the right.
function ProgramRow({ psp, matchScore, onOpen, selected = false, controls }) {
  const price = priceHeadline(psp.costNote);
  const tone = matchScore === undefined ? null : scoreTone(matchScore);
  const shownConds = psp.conditions.slice(0, 2).join(", ");
  const extra = psp.conditions.length - 2;
  return (
    <button type="button" className={`prow${selected ? " on" : ""}`} onClick={onOpen}
      aria-haspopup={controls ? undefined : "dialog"} aria-controls={controls} aria-current={selected ? "true" : undefined}>
      <span className="prow-id">
        <span className="prow-name" translate="no">{psp.drugName.replace(/\s*\(.*\)\s*$/, "")}</span>
        <span className="prow-prog"><b>{psp.programName}</b> from {psp.manufacturer}</span>
      </span>
      <span className="prow-price">
        {price ? (
          <>{price.label !== "You could pay" && <small>{price.label}</small>}<span className="prow-amt"><b>{price.value}</b>{price.unit && <i>{price.unit}</i>}</span></>
        ) : (<><small>Cost help</small><b className="prow-price-sm">Available</b></>)}
      </span>
      <span className="prow-foot">
        <span className={`ptier ptier${psp.tier}`}>Tier {psp.tier}</span>
        {tone && <span className="prow-score" style={{ color: tone.c }}><ScoreRing score={matchScore} />{matchScore}% match</span>}
        <span className="prow-cond">{shownConds}{extra > 0 ? ` +${extra}` : ""}</span>
        <ChevronRight className="prow-go" size={18} aria-hidden="true" />
      </span>
    </button>
  );
}

// Full program detail as a bottom sheet: swipe down, tap outside, Escape, the close button or the phone's back gesture all dismiss it.
function ProgramSheet({ psp, matchScore, matchReason, onClose }) {
  const sheetRef = useRef(null);
  const closeRef = useRef(null);
  const drag = useRef(null);
  const [closing, setClosing] = useState(false);
  const pushed = useRef(false);

  const finish = useRef(onClose);

  const requestClose = (fromHistory = false) => {
    if (closing) return;
    setClosing(true);
    if (pushed.current && !fromHistory) { pushed.current = false; window.history.back(); }
    setTimeout(() => finish.current(), 200);
  };
  const closeRefFn = useRef(requestClose);
  // Keep the latest handlers for the listeners registered once on mount.
  useLayoutEffect(() => { finish.current = onClose; closeRefFn.current = requestClose; });

  useEffect(() => {
    const opener = document.activeElement;
    const root = document.querySelector(".app-shell");
    const tabbar = document.querySelector(".mtab");
    [root, tabbar].forEach(el => el && el.setAttribute("inert", ""));
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    // A history entry lets the Android back button and iOS back gesture close the sheet instead of leaving the page.
    // Skip the push when one is already there (React's dev mode mounts effects twice).
    if (!window.history.state?.cureaidSheet) window.history.pushState({ cureaidSheet: true }, "");
    pushed.current = true;
    const onPop = () => { pushed.current = false; closeRefFn.current(true); };
    const onKey = (e) => { if (e.key === "Escape") closeRefFn.current(); };
    window.addEventListener("popstate", onPop);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("keydown", onKey);
      [root, tabbar].forEach(el => el && el.removeAttribute("inert"));
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, []);

  // Drag the handle area down; past 110px or a quick flick, the sheet closes. A 6px threshold avoids accidental drags.
  const onTouchStart = (e) => { drag.current = { y: e.touches[0].clientY, t: Date.now(), d: 0, active: false }; };
  const onTouchMove = (e) => {
    const s = drag.current; if (!s) return;
    const d = e.touches[0].clientY - s.y;
    if (!s.active && d < 6) return;
    s.active = true; s.d = Math.max(0, d);
    if (sheetRef.current) { sheetRef.current.style.transition = "none"; sheetRef.current.style.transform = `translateY(${s.d}px)`; }
  };
  const onTouchEnd = () => {
    const s = drag.current; drag.current = null;
    if (!s || !sheetRef.current) return;
    const fast = s.d > 40 && s.d / Math.max(1, Date.now() - s.t) > 0.6;
    sheetRef.current.style.transition = "";
    if (s.d > 110 || fast) { sheetRef.current.style.transform = `translateY(${s.d}px)`; requestClose(); }
    else sheetRef.current.style.transform = "";
  };

  return createPortal(
    <>
      <button type="button" tabIndex={-1} aria-hidden="true" className={`psheet-bg${closing ? " out" : ""}`} onClick={() => requestClose()} />
      <div ref={sheetRef} className={`psheet${closing ? " out" : ""}`} role="dialog" aria-modal="true" aria-labelledby={`psp-title-${psp.id}`}>
        <div className="psheet-bar" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
          <span className="psheet-grab" aria-hidden="true" />
          <button ref={closeRef} type="button" className="psheet-x" onClick={() => requestClose()} aria-label="Close program details"><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="psheet-body">
          <PSPDetailCard psp={psp} matchScore={matchScore} matchReason={matchReason} />
        </div>
      </div>
    </>,
    document.body
  );
}

// Programs as full cards on wider screens, and as a grouped list that opens a detail sheet on phones.
function ProgramList({ items, label, split = false }) {
  const isWide = useIsWide();
  const [open, setOpen] = useState(null);
  if (split && isWide) return <ProgramSplit key={items.map(it => it.psp.id).join(",")} items={items} label={label} />;
  return (
    <>
      <div className="pgroup" role="list" aria-label={label}>
        {items.map((it) => (
          <div role="listitem" key={it.psp.id}>
            <ProgramRow psp={it.psp} matchScore={it.score} onOpen={() => setOpen(it)} />
          </div>
        ))}
      </div>
      {open && <ProgramSheet psp={open.psp} matchScore={open.score} matchReason={open.reason} onClose={() => setOpen(null)} />}
    </>
  );
}

// Plain-language condition groups for browsing (findhelp-style), built from each program's specialty field.
const CATEGORIES = [
  { key: "cancer", label: "Cancer", match: /oncology/i, icon: Ribbon },
  { key: "neuro", label: "Brain and nerves", match: /neurology/i, icon: Brain },
  { key: "eyes", label: "Eyes", match: /ophthalmology/i, icon: Eye },
  { key: "skin", label: "Skin", match: /dermatology/i, icon: Hand },
  { key: "joints", label: "Joints and arthritis", match: /rheumatology/i, icon: Bone },
  { key: "lungs", label: "Lungs and asthma", match: /pulmonology|allergy/i, icon: Wind },
  { key: "heart", label: "Heart", match: /cardiology/i, icon: HeartPulse },
  { key: "blood", label: "Blood and kidneys", match: /hematology|nephrology/i, icon: Droplet },
  { key: "gut", label: "Digestive", match: /gastroenterology/i, icon: Salad },
  { key: "rare", label: "Rare diseases", match: /rare disease|metabolic|endocrinology/i, icon: Dna },
].map(c => {
  const programs = PSP_DATABASE.filter(p => c.match.test(p.specialty));
  // How many programs in the group start at $0 or free, shown as a share on each tile.
  return { ...c, programs, zero: programs.filter(p => priceSortValue(p) === 0).length };
});

const HOME_EXAMPLES = ["Dupixent", "Humira", "Stelara"].map(n => PSP_DATABASE.find(p => p.drugName.startsWith(n))).filter(Boolean);
// Different conditions from the hero cards, so the list below shows the range of what's covered.
const PRICE_EXAMPLES = ["Ocrevus", "Trikafta", "Nurtec", "Entresto"].map(n => PSP_DATABASE.find(p => p.drugName.startsWith(n))).filter(Boolean);
// Drugmakers with the most programs in the database, named in plain text (no logos).
const TOP_MAKERS = (() => {
  const count = {};
  PSP_DATABASE.forEach(p => { const k = p.manufacturer.split(/\s*[/(]\s*/)[0].trim(); count[k] = (count[k] || 0) + 1; });
  return Object.entries(count).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([k]) => k);
})();

// Medication and condition names from the bundled database, for type-ahead suggestions.
const SUGGESTIONS = (() => {
  const seen = new Map();
  PSP_DATABASE.forEach(p => {
    const drug = p.drugName.replace(/\s*\(.*\)\s*$/, "");
    if (!seen.has(drug.toLowerCase())) seen.set(drug.toLowerCase(), { label: drug, kind: "Medication" });
    p.conditions.forEach(c => { if (!seen.has(c.toLowerCase())) seen.set(c.toLowerCase(), { label: c, kind: "Condition" }); });
  });
  return [...seen.values()].map(s => ({ ...s, key: s.label.toLowerCase() }));
})();
const DRUG_NAMES = SUGGESTIONS.filter(s => s.kind === "Medication").map(s => s.label).sort();
const CONDITION_NAMES = SUGGESTIONS.filter(s => s.kind === "Condition").map(s => s.label).sort();

function suggestFor(text) {
  const q = text.trim().toLowerCase();
  if (q.length < 2) return [];
  return SUGGESTIONS
    .filter(s => s.key.includes(q))
    .sort((a, b) => (b.key.startsWith(q) - a.key.startsWith(q)) || a.label.length - b.label.length)
    .slice(0, 6);
}

function Highlight({ text, query }) {
  const i = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (i < 0 || !query.trim()) return text;
  const n = query.trim().length;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + n)}</mark>{text.slice(i + n)}</>;
}


// Guilloche: the interlaced line rosettes printed on real cards, checks and banknotes.
// Built once from closed curves r(t) = R + A·sin(n·t + phase); each phase shift adds one strand.
function rosettePath(cx, cy, R, A, n, strands, steps = 360) {
  let d = "";
  for (let m = 0; m < strands; m++) {
    const ph = (m * 2 * Math.PI) / (n * strands);
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 * Math.PI;
      const r = R + A * Math.sin(n * t + ph * n);
      const x = cx + r * Math.cos(t), y = cy + r * Math.sin(t);
      d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += "Z";
  }
  return d;
}
const CARD_GUILLOCHE = rosettePath(266, 30, 78, 20, 9, 14) + rosettePath(266, 30, 44, 9, 12, 8);
const BIG_GUILLOCHE = rosettePath(300, 300, 240, 52, 11, 22, 540) + rosettePath(300, 300, 150, 26, 15, 14, 480) + rosettePath(300, 300, 80, 12, 9, 10, 360);
function Guilloche({ className = "", big = false }) {
  return (
    <svg className={className} viewBox={big ? "0 0 600 600" : "0 0 320 202"} preserveAspectRatio={big ? "xMidYMid meet" : "xMaxYMin slice"} aria-hidden="true" focusable="false">
      <path d={big ? BIG_GUILLOCHE : CARD_GUILLOCHE} />
    </svg>
  );
}

// A program's savings drawn as the wallet card patients carry to the pharmacy.
// No member ID, BIN or PCN numbers, so it can never pass for a working card.
const CARD_TONES = ["teal", "navy", "sage"];
function CopayCard({ psp, tone, size = "md", className = "", style }) {
  const price = priceHeadline(psp.costNote);
  const t = tone || CARD_TONES[psp.id % 3];
  return (
    <div className={`ccard ccard-${t} ccard-${size} ${className}`} style={style}>
      <Guilloche className="ccard-gl" />
      <div className="ccard-top">
        <span className="ccard-prog" translate="no">{psp.programName.split(" / ")[0]}</span>
        <span className="ccard-tier">Tier {psp.tier}</span>
      </div>
      <div className="ccard-maker">{psp.manufacturer}</div>
      <div className="ccard-foot">
        <div className="ccard-price">
          <small>{price ? price.label : "Cost help"}</small>
          <b>{price ? price.value : "Available"}{price?.unit && <i>{price.unit}</i>}</b>
        </div>
        <span className="ccard-drug" translate="no">{psp.drugName.replace(/\s*\(.*\)\s*$/, "")}</span>
      </div>
    </div>
  );
}


const useIsWide = () => useIsMobile("(min-width: 1024px)");

// Two panes on wide screens: results on the left, the selected program on the right (like a mail app).
function ProgramSplit({ items, label }) {
  const [selId, setSelId] = useState(items[0]?.psp.id);
  const sel = items.find(it => it.psp.id === selId) || items[0];
  const detailRef = useRef(null);
  if (!sel) return null;
  const choose = (it) => { setSelId(it.psp.id); detailRef.current?.scrollTo({ top: 0 }); };
  return (
    <div className="split">
      <div className="pgroup split-list" role="list" aria-label={label}>
        {items.map(it => (
          <div role="listitem" key={it.psp.id}>
            <ProgramRow psp={it.psp} matchScore={it.score} selected={it.psp.id === sel.psp.id} controls="program-detail" onOpen={() => choose(it)} />
          </div>
        ))}
      </div>
      <section id="program-detail" className="split-detail" ref={detailRef} aria-live="polite" aria-label={`${sel.psp.drugName} program details`}>
        <PSPDetailCard key={sel.psp.id} psp={sel.psp} matchScore={sel.score} matchReason={sel.reason} />
      </section>
    </div>
  );
}

// Radio choices as large, explained cards. Native radios, so arrow keys, labels and screen readers work as expected.
function RadioCards({ name, legend, hint, options, value, onChange, legendRef }) {
  return (
    <fieldset className="rcards">
      <legend ref={legendRef} tabIndex={-1} className="q-legend">{legend}</legend>
      {hint && <p className="q-hint">{hint}</p>}
      <div className="rcards-grid">
        {options.map(o => {
          const [v, title, sub] = Array.isArray(o) ? o : [o, o, ""];
          const id = `${name}-${String(v).replace(/[^a-z0-9]+/gi, "-")}`;
          return (
            <label key={v} className={`rcard${value === v ? " on" : ""}`} htmlFor={id}>
              <input id={id} type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
              <span className="rcard-t"><b>{title.replace(/(\d)-(\$)/, "$1–$2")}</b>{sub && <small>{sub}</small>}</span>
              <span className="rcard-dot" aria-hidden="true" />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

const INSURANCE_CHOICES = [
  ["Commercial", "Commercial", "Through an employer, a school or the marketplace"],
  ["Medicare", "Medicare", "Federal coverage, usually age 65 and up"],
  ["Medicaid", "Medicaid", "State coverage based on income"],
  ["Underinsured", "Underinsured", "You have insurance but still face large bills"],
  ["No insurance", "No insurance", "You pay for care yourself"],
];
const TOP_CONDITIONS = ["Atopic Dermatitis", "Multiple Sclerosis", "Rheumatoid Arthritis", "Crohn's Disease", "Plaque Psoriasis", "Asthma"];

// One question per screen: condition, insurance, income. Feeds the existing aiMatch() with the same profile shape.
function EligibilityQuiz({ profile, setProfile, onSubmit, loading }) {
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const legendRef = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    legendRef.current?.focus();
  }, [step]);
  const total = 3;
  const next = () => {
    if (step === 0 && !profile.condition.trim()) { setErr("Enter the condition, or choose one of the common ones below."); document.getElementById("q-cond")?.focus(); return; }
    setErr("");
    if (step < total - 1) setStep(step + 1); else onSubmit();
  };
  const back = () => { setErr(""); setStep(Math.max(0, step - 1)); };
  return (
    <form className="quiz" onSubmit={e => { e.preventDefault(); next(); }} noValidate>
      <div className="quiz-top">
        <span className="quiz-count">Question {step + 1} of {total}</span>
        <div className="quiz-bar" aria-hidden="true"><span style={{ width: `${((step + 1) / total) * 100}%` }} /></div>
      </div>
      <div key={step} className="quiz-step">
        {step === 0 && (
          <fieldset className="rcards">
            <legend ref={legendRef} tabIndex={-1} className="q-legend">What condition is the medication for?</legend>
            <p className="q-hint" id="q-cond-hint">Use the name on your prescription or from your doctor.</p>
            <input id="q-cond" className="inp q-input" list="q-cond-list" autoComplete="off" placeholder="e.g. Atopic dermatitis…"
              name="condition" aria-label="Condition" aria-describedby={err ? "q-cond-hint q-cond-err" : "q-cond-hint"} aria-invalid={Boolean(err)}
              value={profile.condition} onChange={e => { setProfile(p => ({ ...p, condition: e.target.value })); if (err) setErr(""); }} />
            <datalist id="q-cond-list">{CONDITION_NAMES.map(c => <option key={c} value={c} />)}</datalist>
            {err && <p className="q-err" id="q-cond-err">{err}</p>}
            <div className="q-common" role="group" aria-label="Common conditions">
              {TOP_CONDITIONS.map(c => (
                <button key={c} type="button" className={`chip${profile.condition === c ? " on" : ""}`} aria-pressed={profile.condition === c}
                  onClick={() => { setProfile(p => ({ ...p, condition: c })); setErr(""); }}>{c}</button>
              ))}
            </div>
          </fieldset>
        )}
        {step === 1 && (
          <RadioCards name="q-ins" legend="What kind of insurance do you have?" hint="Programs set different rules for each. Skip if you’re not sure."
            options={INSURANCE_CHOICES} value={profile.insurance} legendRef={legendRef}
            onChange={v => setProfile(p => ({ ...p, insurance: v }))} />
        )}
        {step === 2 && (
          <RadioCards name="q-inc" legend="What’s your yearly household income?" hint="Before taxes, for everyone in your home. Many free-drug programs use this."
            options={INCOME_OPTIONS} value={profile.income} legendRef={legendRef}
            onChange={v => setProfile(p => ({ ...p, income: v }))} />
        )}
      </div>
      <div className="quiz-nav">
        {step > 0 ? <button type="button" className="btn bo" onClick={back}>Back</button> : <span />}
        <div className="quiz-nav-r">
          {step > 0 && !(step === 1 ? profile.insurance : profile.income) && (
            <button type="button" className="btn bg-ghost" onClick={next}>Skip this question</button>
          )}
          <button type="submit" className="btn bp" disabled={loading}>
            {step === 0 ? "Next: insurance" : step === 1 ? "Next: income" : loading ? "Ranking programs…" : "See my programs"}
          </button>
        </div>
      </div>
    </form>
  );
}

// Turns the plain-text pre-call briefing into sections. Falls back to the raw text if the format is unfamiliar.
function parseBriefing(text) {
  if (!text) return null;
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const sections = blocks.map(b => {
    const [head, ...rest] = b.split("\n");
    const core = head.replace(/\s*\(.*\)\s*$/, "").trim();
    const isHead = core === core.toUpperCase() && /[A-Z]{3}/.test(core) && !/^(•|-|\d+\.)/.test(core);
    const title = isHead ? core.charAt(0) + core.slice(1).toLowerCase() : "";
    const lines = (isHead ? rest : [head, ...rest]).map(l => l.trim()).filter(Boolean);
    const items = lines.map(l => l.replace(/^(•|-|\d+\.)\s*/, ""));
    return { title, items, listed: lines.some(l => /^(•|-|\d+\.)\s/.test(l)) };
  });
  return sections.every(s => s.title) ? sections : null;
}

function Briefing({ text }) {
  const sections = parseBriefing(text);
  const [done, setDone] = useState({});
  if (!sections) return <div className="brief-raw">{text}</div>;
  const renderSec = (s, si) => {
        const key = s.title.toLowerCase();
        if (key.startsWith("documents")) {
          const n = s.items.filter((_, i) => done[`${si}-${i}`]).length;
          return (
            <section key={si} className="brief-sec">
              <div className="brief-h"><h3>{s.title}</h3><span className="brief-count" aria-live="polite">{n} of {s.items.length} ready</span></div>
              <ul className="checklist">
                {s.items.map((it, i) => (
                  <li key={i}>
                    <label><input type="checkbox" checked={Boolean(done[`${si}-${i}`])} onChange={e => setDone(d => ({ ...d, [`${si}-${i}`]: e.target.checked }))} /><span>{it}</span></label>
                  </li>
                ))}
              </ul>
            </section>
          );
        }
        if (key.startsWith("questions")) {
          return (
            <section key={si} className="brief-sec">
              <div className="brief-h"><h3>{s.title.replace(/\s*\(.*\)\s*$/, "")}</h3></div>
              <ol className="qa-list">
                {s.items.map((it, i) => {
                  const [q, ...a] = it.split(/\s+[—–-]\s+/);
                  return <li key={i}><b>{q.replace(/^"|"$/g, "").replace(/^“|”$/g, "")}</b>{a.length > 0 && <span>{a.join(" – ")}</span>}</li>;
                })}
              </ol>
            </section>
          );
        }
        if (key.includes("avoid")) {
          return (
            <section key={si} className="brief-sec">
              <div className="brief-h"><h3>{s.title}</h3></div>
              <ul className="avoid-list">{s.items.map((it, i) => <li key={i}><X size={16} aria-hidden="true" /><span>{it}</span></li>)}</ul>
            </section>
          );
        }
        return (
          <section key={si} className="brief-sec">
            <div className="brief-h"><h3>{s.title}</h3></div>
            {s.listed ? <ul className="plain-list">{s.items.map((it, i) => <li key={i}>{it}</li>)}</ul> : s.items.map((it, i) => <p key={i} className="brief-p">{it}</p>)}
          </section>
        );
  };
  // Two balanced columns on wide screens (each section goes to the shorter column), one column on phones.
  const cols = [[], []], weight = [0, 0];
  sections.forEach((s, si) => { const c = weight[0] <= weight[1] ? 0 : 1; cols[c].push(si); weight[c] += s.items.length + 2; });
  return (
    <div className="brief">
      {cols.map((ids, ci) => <div key={ci} className="brief-col">{ids.map(si => renderSec(sections[si], si))}</div>)}
    </div>
  );
}

function Nav({ page, setPage, user, setUser }) {
  const links = [
    ["Programs", "search", null],
    ["Eligibility", "search", { tab: "match" }],
    ["Call coach", "coach", null],
    ["Costs & appeals", "ailab", null],
    ["Community", "community", null],
    ["About", "about", null],
    ...(user ? [["Dashboard", "dashboard", null]] : []),
  ];
  // The search page has two modes; it announces which one is open so the right tab lights up.
  const [searchTab, setSearchTab] = useState(() => /tab=match/.test(window.location.hash) ? "match" : "chat");
  useEffect(() => {
    const on = (e) => setSearchTab(e.detail);
    window.addEventListener("cureaid:searchtab", on);
    return () => window.removeEventListener("cureaid:searchtab", on);
  }, []);
  const isCurrent = (label, p) => page === p && (p !== "search" || (label === "Eligibility") === (searchTab === "match"));
  const trackRef = useRef(null);
  const [ind, setInd] = useState(null);
  // Slide a white indicator under the current tab. Measured after layout, and again on resize or font load.
  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current; if (!track) return;
      const el = track.querySelector(".nl.on");
      setInd(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready?.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [page, searchTab, user]);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setScrolled(window.scrollY > 8)); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <nav className={`nav${scrolled ? " is-scrolled" : ""}`} aria-label="Main">
      <a className="nav-logo" {...linkProps(setPage, "home")} aria-label="CureAid home">
        <img src="/CureAid_Logo.png" alt="" width="30" height="30" fetchPriority="high" />
        <span translate="no">CureAid</span>
      </a>
      <div className="nav-track" ref={trackRef}>
      {ind && <span className="nav-ind" aria-hidden="true" style={{ transform: `translateX(${ind.x}px)`, width: ind.w }} />}
      <ul className="nav-links">
        {links.map(([label, p, seed]) => {
          const current = isCurrent(label, p);
          return (
            <li key={label}>
              <a className={`nl${current ? " on" : ""}`} aria-current={current ? "page" : undefined} {...linkProps(setPage, p, seed)}>{label}</a>
            </li>
          );
        })}
      </ul>
      </div>
      <div className="nav-r">
        {user ? (
          <>
            <button type="button" className="av nav-acct" onClick={() => setPage("dashboard")} aria-label={`Your dashboard, signed in as ${user.name}`}>{user.name.slice(0, 2).toUpperCase()}</button>
            <button type="button" className="btn bo bsm hide-m" onClick={() => { setUser(null); setPage("home"); }}>Sign out</button>
          </>
        ) : page === "login" || page === "signup" ? null : (
          <>
            <a className="btn bo bsm" {...linkProps(setPage, "login")}>Log in</a>
            <a className="btn bp bsm hide-m" {...linkProps(setPage, "signup")}>Sign up</a>
          </>
        )}
      </div>
    </nav>
  );
}

// Bottom tab bar for phones. Pages that don't earn a tab live in the More sheet.
const MOBILE_TABS = [
  { page: "home", label: "Home", icon: HomeIcon },
  { page: "search", label: "Search", icon: SearchIcon },
  { page: "coach", label: "Coach", icon: GraduationCap },
  { page: "community", label: "Community", icon: Users },
];

function MobileTabBar({ page, setPage, user, setUser }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef(null);
  const inTabs = MOBILE_TABS.some(t => t.page === page);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMoreOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    sheetRef.current?.querySelector("button")?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [moreOpen]);

  const go = (p) => { setMoreOpen(false); setPage(p); };
  const moreItems = [
    { page: "ailab", label: "Costs & appeals", sub: "Yearly cost estimate and appeal letters", icon: Calculator },
    { page: "about", label: "About CureAid", sub: "Our mission and the team", icon: Info },
    ...(user ? [{ page: "dashboard", label: "Dashboard", sub: "Saved programs and activity", icon: LayoutDashboard }] : []),
  ];

  return (
    <>
      <nav className="mtab" aria-label="Primary">
        {MOBILE_TABS.map(({ page: p, label, icon: Icon }) => (
          <a key={p} className={page === p ? "on" : ""} aria-current={page === p ? "page" : undefined} {...linkProps(go, p)}>
            <span className="ic"><Icon size={21} strokeWidth={page === p ? 2.3 : 2} aria-hidden="true" /></span>{label}
          </a>
        ))}
        <button className={!inTabs || moreOpen ? "on" : ""} aria-haspopup="dialog" aria-expanded={moreOpen} onClick={() => setMoreOpen(o => !o)}>
          <span className="ic"><Ellipsis size={21} aria-hidden="true" /></span>More
        </button>
      </nav>
      {moreOpen && (
        <>
          <button type="button" tabIndex={-1} aria-hidden="true" className="msheet-bg" onClick={() => setMoreOpen(false)} />
          <div className="msheet" role="dialog" aria-modal="true" aria-labelledby="msheet-title" ref={sheetRef}>
            <div className="msheet-grab" aria-hidden="true" />
            <div className="msheet-head">
              <h2 id="msheet-title">More</h2>
              <button className="msheet-x" onClick={() => setMoreOpen(false)} aria-label="Close menu"><X size={20} /></button>
            </div>
            {moreItems.map(({ page: p, label, sub, icon: Icon }) => (
              <button key={p} className={`msheet-item${page === p ? " on" : ""}`} onClick={() => go(p)}>
                <span className="ic"><Icon size={19} aria-hidden="true" /></span>
                <span className="ms-t"><b>{label}</b><small>{sub}</small></span>
                <ChevronRight size={18} color="var(--muted)" aria-hidden="true" />
              </button>
            ))}
            <div className="msheet-sep" />
            {user ? (
              <button className="msheet-item danger" onClick={() => { setUser(null); go("home"); }}>
                <span className="ic"><LogOut size={19} aria-hidden="true" /></span><span><b>Sign out</b><small>{user.email}</small></span>
              </button>
            ) : (
              <>
                <button className="msheet-item" onClick={() => go("signup")}>
                  <span className="ic"><UserPlus size={19} aria-hidden="true" /></span><span className="ms-t"><b>Create free account</b><small>Save programs and track applications</small></span>
                </button>
                <button className="msheet-item" onClick={() => go("login")}>
                  <span className="ic"><LogIn size={19} aria-hidden="true" /></span><span className="ms-t"><b>Log in</b><small>Already have an account</small></span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

// Search input with icon and clear button, shared by the home hero and the Search page.
function SearchField({ value, onChange, placeholder, inputRef, label = "Search medications or conditions", onFocus, onBlur, onKeyDown }) {
  return (
    <div className="sfield">
      <SearchIcon size={19} aria-hidden="true" />
      <input ref={inputRef} type="search" name="q" enterKeyHint="search" autoComplete="off" autoCorrect="off" spellCheck={false}
        aria-label={label} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown} />
      {value && <button type="button" className="sfield-x" aria-label="Clear search" onClick={() => { onChange(""); inputRef?.current?.focus(); }}><X size={18} /></button>}
    </div>
  );
}

const POPULAR_DRUGS = ["Dupixent","Humira","Stelara","Keytruda","Ocrevus","Entresto"].filter(n => PSP_DATABASE.some(p => p.drugName.startsWith(n)));

function Footer({ setPage }) {
  const cols = [
    { title: "Popular medications", links: POPULAR_DRUGS.map(n => [n, "search", { q: n }]) },
    { title: "Free tools", links: [
      ["Programs", "search", null],
      ["Eligibility", "search", { tab: "match" }],
      ["Call coach", "coach", null],
      ["Appeal letter", "ailab", { tab: "f4" }],
      ["Cost estimate", "ailab", null],
    ] },
    { title: "CureAid", links: [
      ["About us", "about", null],
      ["Patient community", "community", null],
      ["Browse by condition", "home", null],
    ] },
  ];
  return (
    <footer className="ft">
      <div className="ft-in">
        <div className="ft-grid">
          <div className="ft-brand">
            <div className="ft-logo"><img src="/CureAid_Logo.png" alt="" width="32" height="32" loading="lazy" /><span translate="no">CureAid</span></div>
            <p>Find the drugmaker program that pays for your specialty medication, check if you qualify, and prepare for the call.</p>
            <a className="ft-mail" href="mailto:support@cureaid.com">support@cureaid.com</a>
          </div>
          {cols.map(c => (
            <nav key={c.title} className="ft-col" aria-label={c.title}>
              <h2>{c.title}</h2>
              <ul>{c.links.map(([label, p, sd]) => <li key={label}><a {...linkProps(setPage, p, sd)}>{label}</a></li>)}</ul>
            </nav>
          ))}
        </div>
        <div className="ft-bottom">
          <p>CureAid is not insurance and is not affiliated with or paid by any pharmaceutical company. Program terms belong to each manufacturer and can change. CureAid does not give medical advice.</p>
          <p>A student-led project from Frisco, Texas. © 2026 CureAid.</p>
        </div>
      </div>
    </footer>
  );
}


// ── Price groups for the data story, computed from each program's own listed price ──
const PRICE_GROUPS = (() => {
  const groupOf = (p) => {
    const h = priceHeadline(p.costNote);
    if (!h) return "varies";
    if (h.value === "Free") return "zero";
    const n = Number((h.value.match(/\$([\d,]+)/) || [])[1]?.replace(/,/g, ""));
    if (n === 0) return "zero";
    if (n <= 10) return "low";
    return "more";
  };
  const defs = [
    { key: "zero", label: "$0 or free" },
    { key: "low", label: "$1 to $10" },
    { key: "more", label: "More than $10" },
    { key: "varies", label: "Varies by plan" },
  ];
  const byKey = Object.fromEntries(defs.map(d => [d.key, []]));
  PSP_DATABASE.forEach(p => byKey[groupOf(p)].push(p));
  defs.forEach(d => byKey[d.key].sort((a, b) => a.drugName.localeCompare(b.drugName)));
  return defs.map(d => ({ ...d, programs: byKey[d.key] }));
})();

function programPriceText(p) {
  const h = priceHeadline(p.costNote);
  return h ? `${h.value}${h.unit}` : "Varies by plan";
}

// Every program as one square, grouped by what eligible patients pay.
function PriceWaffle() {
  const [hover, setHover] = useState(null);
  return (
    <figure className="waffle-fig">
      <div className="waffle" role="img" aria-label={`${DB_STATS.programs} programs grouped by the lowest price each lists: ${PRICE_GROUPS.map(g => `${g.programs.length} ${g.label}`).join(", ")}.`}
        onPointerLeave={() => setHover(null)}>
        {PRICE_GROUPS.flatMap(g => g.programs.map(p => (
          <span key={p.id} className={`wsq wsq-${g.key}${hover?.id === p.id ? " on" : ""}`} onPointerEnter={() => setHover(p)} />
        )))}
      </div>
      <figcaption className="waffle-cap" aria-hidden="true">
        {hover ? <><b translate="no">{hover.drugName.replace(/\s*\(.*\)\s*$/, "")}</b> <span>{hover.programName}</span> <em>{programPriceText(hover)}</em></> : <span><span className="on-hover">Point at</span><span className="on-touch">Tap</span> a square to see the program.</span>}
      </figcaption>
      <ul className="waffle-key">
        {PRICE_GROUPS.map(g => (
          <li key={g.key}><span className={`wsq wsq-${g.key}`} aria-hidden="true" /><b>{g.programs.length}</b> {g.label}</li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>Programs by lowest listed price</caption>
        <thead><tr><th scope="col">Price group</th><th scope="col">Programs</th></tr></thead>
        <tbody>{PRICE_GROUPS.map(g => <tr key={g.key}><td>{g.label}</td><td>{g.programs.length}</td></tr>)}</tbody>
      </table>
      <p className="waffle-note">The lowest price each program lists, usually for people with commercial insurance. Eligibility rules apply.</p>
    </figure>
  );
}

// Live search in the hero: suggestions show the price before you leave the page (combobox, focus stays in the field).
function HeroSearch({ onSearch, onPreview }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const items = suggestFor(q).slice(0, 5).map(s => {
    if (s.kind === "Medication") {
      const p = PSP_DATABASE.find(x => x.drugName.replace(/\s*\(.*\)\s*$/, "") === s.label);
      return { ...s, detail: p ? p.programName.split(" / ")[0] : "", value: p ? programPriceText(p) : "" };
    }
    const n = PSP_DATABASE.filter(x => x.conditions.some(c => c.toLowerCase() === s.key)).length;
    return { ...s, detail: "Condition", value: `${n} program${n === 1 ? "" : "s"}` };
  });
  const show = open && items.length > 0;
  const go = (label) => { setOpen(false); onSearch(label); };
  // Live preview: the highlighted suggestion (or the first one) becomes the front copay card in the hero.
  const pick = items[active >= 0 ? active : 0];
  const previewId = (() => {
    if (!pick) return null;
    if (pick.kind === "Medication") return PSP_DATABASE.find(x => x.drugName.replace(/\s*\(.*\)\s*$/, "") === pick.label)?.id ?? null;
    const progs = PSP_DATABASE.filter(x => x.conditions.some(c => c.toLowerCase() === pick.key));
    return progs.sort((a, b) => priceSortValue(a) - priceSortValue(b))[0]?.id ?? null;
  })();
  useEffect(() => { onPreview?.(previewId); }, [previewId]); // eslint-disable-line react-hooks/exhaustive-deps
  const onKey = (e) => {
    if (!show) { if (e.key === "ArrowDown" && items.length) { setOpen(true); setActive(0); e.preventDefault(); } return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => (a + 1) % items.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => (a <= 0 ? items.length - 1 : a - 1)); }
    else if (e.key === "Escape") { setOpen(false); setActive(-1); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); go(items[active].label); }
  };
  return (
    <div className="hs">
      <form className="hero4-search" role="search" onSubmit={e => { e.preventDefault(); if (!q.trim()) { inputRef.current?.focus(); return; } go(q.trim()); }}>
        <div className="sfield">
          <SearchIcon size={19} aria-hidden="true" />
          <input ref={inputRef} type="search" name="q" enterKeyHint="search" autoComplete="off" autoCorrect="off" spellCheck={false}
            role="combobox" aria-expanded={show} aria-controls="hs-list" aria-autocomplete="list"
            aria-activedescendant={show && active >= 0 ? `hs-opt-${active}` : undefined}
            aria-label="Search medications or conditions" placeholder="Drug or condition…" value={q}
            onChange={e => { setQ(e.target.value); setOpen(true); setActive(-1); }}
            onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)} onKeyDown={onKey} />
          {q && <button type="button" className="sfield-x" aria-label="Clear search" onClick={() => { setQ(""); inputRef.current?.focus(); }}><X size={18} /></button>}
        </div>
        <button type="submit" className="btn bp">Search</button>
      </form>
      {show && (
        <ul id="hs-list" role="listbox" aria-label="Suggestions" className="hs-list">
          {items.map((it, i) => (
            <li key={it.key} id={`hs-opt-${i}`} role="option" aria-selected={i === active} className={i === active ? "on" : ""}
              onMouseDown={e => e.preventDefault()} onClick={() => go(it.label)} onPointerEnter={() => setActive(i)}>
              <span className="hs-ic" aria-hidden="true">{it.kind === "Medication" ? <Pill size={16} /> : <Stethoscope size={16} />}</span>
              <span className="hs-t"><b translate={it.kind === "Medication" ? "no" : undefined}><Highlight text={it.label} query={q} /></b><small>{it.detail}</small></span>
              <span className={`hs-v${it.kind === "Medication" ? " money" : ""}`}>{it.value}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="sr-only" role="status">{show ? `${items.length} suggestions. Use the up and down arrows to choose.` : ""}</p>
    </div>
  );
}

// Small, static previews of the real screens for each step of "How enrollment works". Decorative: the text beside them says the same thing.
function HowVignette({ step }) {
  const p = HOME_EXAMPLES[0];
  if (step === 0) return (
    <div className="vig" aria-hidden="true">
      <div className="vig-field"><SearchIcon size={15} /><span>Dupi<i className="vig-caret" /></span></div>
      <div className="vig-opt">
        <span className="hs-ic"><Pill size={14} /></span>
        <span className="vig-t"><b>Dupixent</b><small>{p ? p.programName.split(" / ")[0] : ""}</small></span>
        <span className="vig-money">$0<small>/month</small></span>
      </div>
    </div>
  );
  if (step === 1) return (
    <div className="vig" aria-hidden="true">
      <div className="vig-q"><small>Question 2 of 3</small><span className="vig-bar"><i /></span></div>
      <b className="vig-legend">What kind of insurance do you have?</b>
      <div className="vig-radio on"><span>Commercial</span><i /></div>
      <div className="vig-radio"><span>Medicare</span><i /></div>
    </div>
  );
  return (
    <div className="vig" aria-hidden="true">
      <div className="vig-q"><b className="vig-legend">Documents</b><small>2 of 3 ready</small></div>
      {[["Insurance card, front and back", true], ["Last year’s tax return", true], ["Prescriber’s phone number", false]].map(([t, on]) => (
        <div key={t} className={`vig-check${on ? " on" : ""}`}><i>{on && <Check size={12} strokeWidth={3} />}</i><span>{t}</span></div>
      ))}
    </div>
  );
}

function HeroGeometric({ subtitle, onSearch }) {
  const fanRef = useRef(null);
  const [previewId, setPreviewId] = useState(null);
  const preview = previewId != null ? PSP_DATABASE.find(p => p.id === previewId) : null;
  const front = preview || HOME_EXAMPLES[2];
  const backs = HOME_EXAMPLES.filter(p => p.id !== front.id).slice(0, 2);
  const tilt = (e) => {
    const el = fanRef.current; if (!el || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--tx", `${(x * 8).toFixed(2)}deg`); el.style.setProperty("--ty", `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`); el.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const reset = () => { const el = fanRef.current; if (el) { ["--tx", "--ty", "--mx", "--my"].forEach(k => el.style.removeProperty(k)); } };
  return (
    <section className="hero4" aria-labelledby="hero-title">
      <div className="hero4-in">
        <div className="hero4-copy">
          <h1 id="hero-title" className="hero4-h">Find the program that pays for your medication.</h1>
          <p className="hero4-p">{subtitle}</p>
          <HeroSearch onSearch={onSearch} onPreview={setPreviewId} />
          <div className="hero-quick" aria-label="Example searches">
            <span>Try</span>
            {["Dupixent","Humira","Psoriasis","Multiple sclerosis"].map(t => <button key={t} type="button" onClick={() => onSearch(t)}>{t}</button>)}
          </div>
          <ul className="hero-checks">
            {["Free, no account needed","Enrollment links go to the drugmaker’s own site","Not affiliated with any drugmaker"].map(t => (
              <li key={t}><Check size={16} aria-hidden="true" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="hcards-wrap" onPointerMove={tilt} onPointerLeave={reset}>
          <div className="hcards" ref={fanRef} aria-hidden="true">
            {backs.map((p, i) => <CopayCard key={`b${i}-${p.id}`} psp={p} tone={["sage", "navy"][i]} className={`hc hc-${i}`} />)}
            <CopayCard key={`f-${front.id}`} psp={front} tone="teal" className={`hc hc-2${preview ? " hc-live" : ""}`} />
          </div>
          <Guilloche big className="hero-art" />
        </div>
      </div>
      <div className="makers">
        <p className="makers-k">Programs from {DB_STATS.manufacturers} drugmakers, including</p>
        <ul className="makers-l" translate="no">{TOP_MAKERS.map(m => <li key={m}>{m}</li>)}</ul>
        <p className="makers-n">Listed for reference. CureAid isn’t affiliated with or paid by any of them.</p>
      </div>
    </section>
  );
}

function Home({ setPage }) {
  const zero = PRICE_GROUPS[0].programs.length;
  return (
    <div className="page">
      <HeroGeometric
        subtitle={`Drugmakers run support programs that cut specialty drug costs, often to $0 a month. Search ${DB_STATS.programs} of them from ${DB_STATS.manufacturers} manufacturers.`}
        onSearch={(q) => setPage("search", { q })}
      />

      <section className="hm" aria-label="Find help">
        <div className="hm-in">
          <div className="hm-block">
            <div className="sec-head">
              <h2 className="hm-h">Browse by condition</h2>
              <p className="hm-sub">Not sure of the drug name? Start with what it treats.</p>
            </div>
            <div className="cats">
              {CATEGORIES.map(c => (
                <a key={c.key} className="cat" {...linkProps(setPage, "search", { cat: c.key })}>
                  <span className="cat-ic"><c.icon size={20} aria-hidden="true" /></span>
                  <span className="cat-t"><b>{c.label}</b><small>{c.programs.length} programs</small></span>
                  <span className="cat-share">
                    <span className="cat-bar" aria-hidden="true"><i style={{ width: `${(c.zero / c.programs.length) * 100}%` }} /></span>
                    <small>{c.zero} start at $0</small>
                  </span>
                </a>
              ))}
            </div>
          </div>
          <div className="hm-cols">
            <div className="hm-block">
              <div className="sec-head">
                <h2 className="hm-h">What eligible patients pay</h2>
                <p className="hm-sub">From each program’s own terms. Open one for who qualifies and how to enroll.</p>
              </div>
              <ProgramList items={PRICE_EXAMPLES.map(p => ({ psp: p }))} label="Example programs" />
              <p className="disclaim">CureAid is not insurance and is not paid by drugmakers. Each program sets its own eligibility and can change its terms.</p>
              <a className="btn bo hm-more" {...linkProps(setPage, "search")}>See all {DB_STATS.programs} programs</a>
            </div>
            <div className="hm-block">
              <div className="qualify">
                <h2 className="hm-h">Not sure you qualify?</h2>
                <p>Answer three questions about your condition, insurance and income. CureAid ranks every program and tells you why.</p>
                <ol className="qualify-steps" aria-label="The three questions"><li>Condition</li><li>Insurance</li><li>Income</li></ol>
                <a className="btn bp" {...linkProps(setPage, "search", { tab: "match" })}>Check if I qualify</a>
              </div>
              <h2 className="hm-h hm-h-sm">After you find a program</h2>
              <div className="tasklist">
                {[
                  { icon: Headset, title: "Prepare for the enrollment call", sub: "What to have ready and what they’ll ask", p: "coach" },
                  { icon: FileText, title: "Appeal an insurance denial", sub: "Draft a letter for your doctor to review", p: "ailab", seed: { tab: "f4" } },
                  { icon: Calculator, title: "Estimate my yearly cost", sub: "With and without a program", p: "ailab" },
                ].map(({ icon: Icon, title, sub, p, seed }) => (
                  <a key={title} className="task" {...linkProps(setPage, p, seed || null)}>
                    <span className="task-ic"><Icon size={19} aria-hidden="true" /></span>
                    <span className="task-t"><b>{title}</b><small>{sub}</small></span>
                    <ChevronRight size={18} className="task-go" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="story" aria-labelledby="story-title">
        <div className="story-in">
          <div className="story-copy">
            <h2 id="story-title" className="story-h">{zero} of {DB_STATS.programs} programs start at $0 a month.</h2>
            <p className="story-p">Each square is one program in CureAid, grouped by the lowest price it lists for eligible patients. The help exists. The hard part is knowing it’s there.</p>
          </div>
            <dl className="story-facts">
              <div><dt>53%</dt><dd>of retail prescriptions that cost patients over $250 went unfilled in 2022. <a href="https://biocentury.com/article/647795/iqvia-53-of-retail-prescriptions-costing-over-250-are-abandoned" target="_blank" rel="noopener noreferrer">IQVIA, 2023<span className="sr-only"> (opens in a new tab)</span></a></dd></div>
              <div><dt>Under 10%</dt><dd>of the $30 billion+ in yearly manufacturer copay assistance gets used. <a href="https://www.businesswire.com/news/home/20251021175733/en" target="_blank" rel="noopener noreferrer">RxUtility, 2025<span className="sr-only"> (opens in a new tab)</span></a></dd></div>
            </dl>
          <PriceWaffle />
        </div>
      </section>

      <section className="how" aria-labelledby="how-title">
        <div className="how-in">
          <h2 id="how-title" className="how-h">How enrollment works</h2>
          <ol className="how-steps" tabIndex={0} aria-label="Three steps">
            {[
              ["Find your program", "Search by drug or condition. Each program shows what eligible patients pay and who qualifies, in plain English.", "Search programs", "search", null],
              ["Check that you qualify", "Answer three questions. CureAid ranks programs on your condition, insurance and income, and explains each score.", "Check if I qualify", "search", { tab: "match" }],
              ["Call with a plan", "Get a checklist of documents, the questions the program will ask, and help in real time while you’re on the phone.", "Plan my call", "coach", null],
            ].map(([t, d, cta, p, seed], i) => (
              <li key={t}>
                <HowVignette step={i} />
                <span className="how-n" aria-hidden="true">{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
                <a className="how-link" {...linkProps(setPage, p, seed)}>{cta}<ChevronRight size={16} aria-hidden="true" /></a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cg" aria-labelledby="cg-title">
        <div className="cg-in">
          <div>
            <h2 id="cg-title" className="cg-h">Applying for a parent or partner?</h2>
            <p className="cg-p">Many programs let a caregiver call or apply for someone else, with that person’s signed permission. Have these ready before you call.</p>
            <a className="btn bp" {...linkProps(setPage, "coach")}>Prepare for the call</a>
          </div>
          <ul className="cg-list">
            {["Their insurance card, front and back","Household income from last year’s tax return","The prescribing doctor’s name and office phone","The exact medication name and dose"].map(t => (
              <li key={t}><CircleCheck size={19} aria-hidden="true" /><span>{t}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="hood" aria-labelledby="hood-title">
        <div className="hood-in">
          <div className="sec-head">
            <h2 id="hood-title" className="hm-h">What’s under the hood</h2>
            <p className="hm-sub">Three systems do the work behind the search. Here’s what each one does and whether it’s live.</p>
          </div>
          <ul className="hood-list">
            {[
              ["Match scoring", "Scores every program against your condition, insurance and income, then explains the score in a sentence.", "Live", Gauge],
              ["Plain-English eligibility", "Rewrites the legal eligibility text from each manufacturer into short, plain bullets.", "Live", FileText],
              ["Program update crawler", "Watches manufacturer pages for changes to eligibility, income limits and enrollment windows.", "In development", SearchIcon],
            ].map(([t, d, status, Icon]) => (
              <li key={t}>
                <span className="hood-ic"><Icon size={20} aria-hidden="true" /></span>
                <div><h3>{t}</h3><p>{d}</p></div>
                <span className={`hood-status${status === "Live" ? " live" : ""}`}>{status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="closing" aria-labelledby="closing-title">
        <Guilloche big className="closing-art" />
        <div className="closing-in">
          <h2 id="closing-title" className="closing-h">Start with your medication.</h2>
          <p>Free to use. No account needed. Every enrollment link goes to the drugmaker’s own site.</p>
          <div className="closing-actions">
            <a className="btn bp blg" {...linkProps(setPage, "search")}>Search programs</a>
            <a className="btn bo blg" {...linkProps(setPage, "search", { tab: "match" })}>Check if I qualify</a>
          </div>
        </div>
      </section>
    </div>
  );
}
// Loading placeholders shaped like the real results: rows on phones, rows plus a detail pane on wide screens.
function SkeletonRows({ n = 4 }) {
  return (
    <div className="pgroup skel-rows" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="prow skel-row">
          <span className="prow-id"><span className="skel sk-name" /><span className="skel sk-line" /></span>
          <span className="skel sk-price" />
          <span className="prow-foot"><span className="skel sk-meta" /></span>
        </div>
      ))}
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="split" aria-hidden="true">
      <SkeletonRows n={4} />
      <div className="split-detail skel-detail">
        <span className="skel sk-card" />
        <span className="skel sk-title" />
        <span className="skel sk-line" />
        <span className="skel sk-block" />
        <span className="skel sk-block sk-short" />
      </div>
    </div>
  );
}

const INCOME_OPTIONS = ["Under $25,000","$25,000-$50,000","$50,000-$75,000","$75,000-$100,000","Over $100,000"];

function Search({ seed }) {
  const [input, setInput] = useState(seed?.q || "");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(seed?.q?.trim() || "");
  const [loading, setLoading] = useState(Boolean(seed?.q));
  const [aiSummary, setAiSummary] = useState("");
  const [tab, setTab] = useState(seed?.tab || "chat");
  const [matchProfile, setMatchProfile] = useState({ condition: "", income: "", insurance: "" });
  const [matchResults, setMatchResults] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [tierF, setTierF] = useState(/^[45]$/.test(seed?.tier || "") ? seed.tier : "all");
  const [sort, setSort] = useState(seed?.sort === "price" ? "price" : "best");
  const [focused, setFocused] = useState(false);
  const [cat, setCat] = useState(seed?.cat || null);
  const catObj = CATEGORIES.find(c => c.key === cat);
  const isMobile = useIsMobile();
  const inputRef = useRef(null);
  const suggRef = useRef(null);
  const doSearch = async (q) => {
    if (!q.trim()) return;
    setFocused(false); setTierF("all"); setCat(null);
    setLoading(true); setResults([]); setAiSummary(""); setSearched(q.trim());
    const { matched, summary } = await aiSearch(q, PSP_DATABASE);
    setResults(matched);
    setAiSummary(summary);
    setLoading(false);
  };
  const doMatch = async () => {
    if (!matchProfile.condition) return;
    setMatchLoading(true); setMatchResults([]);
    const scored = await aiMatch(matchProfile, PSP_DATABASE);
    setMatchResults(scored);
    setMatchLoading(false);
  };
  // A search started from the home screen arrives as a seed and runs once on mount.
  useEffect(() => {
    if (!seed?.q) return;
    aiSearch(seed.q, PSP_DATABASE).then(({ matched, summary }) => { setResults(matched); setAiSummary(summary); setLoading(false); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const base = tab === "match" ? { tab: "match" } : catObj && !searched ? { cat } : searched ? { q: searched } : null;
    const params = tab === "match" ? base : { ...base, ...(tierF !== "all" ? { tier: tierF } : {}), ...(sort === "price" ? { sort } : {}) };
    window.dispatchEvent(new CustomEvent("cureaid:searchtab", { detail: tab }));
    const h = hrefFor("search", params);
    if (window.location.hash !== h) window.history.replaceState(window.history.state, "", h);
  }, [tab, searched, cat, sort, tierF]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = catObj && !searched ? catObj.programs : results.length ? results : PSP_DATABASE.slice(0, 4);
  const tiers = [...new Set(shown.map(p => String(p.tier)))].sort();
  // A tier carried in from a link only applies when these results include it.
  const tierOn = tiers.includes(tierF) ? tierF : "all";
  const filtered = tierOn === "all" ? shown : shown.filter(p => String(p.tier) === tierF);
  const visible = sort === "price" ? [...filtered].sort((a, b) => priceSortValue(a) - priceSortValue(b)) : filtered;
  // The search falls back to related programs when nothing matches; it says so in its summary.
  const fallback = /^No exact match/i.test(aiSummary);
  const noMatch = Boolean(searched) && !loading && (!results.length || fallback) && !(catObj && !searched);
  const sugg = focused && input.trim() !== searched ? suggestFor(input) : [];
  const pick = (label) => { setInput(label); inputRef.current?.blur(); doSearch(label); };
  // Focus may move from the field into the suggestion list without closing it.
  const leaveSearch = (e) => { if (!e.relatedTarget || !e.currentTarget.closest(".sbox")?.contains(e.relatedTarget)) setFocused(false); };
  const onFieldKey = (e) => { if (e.key === "ArrowDown" && sugg.length) { e.preventDefault(); suggRef.current?.querySelector("button")?.focus(); } else if (e.key === "Escape") setFocused(false); };
  const onSuggKey = (e) => {
    const items = [...(suggRef.current?.querySelectorAll("button") || [])];
    const i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(i + 1, items.length - 1)]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (i <= 0) inputRef.current?.focus(); else items[i - 1].focus(); }
    else if (e.key === "Escape") { setFocused(false); inputRef.current?.focus(); }
  };
  return (
    <div className="page">
      <header className={`pghead${searched && tab !== "match" ? " is-searched" : ""}`}>
        <div className="pghead-in">
          <h1>{tab === "match" ? "Check if you qualify" : "Find your support program"}</h1>
          <p>{tab === "match" ? "Three questions about your condition, insurance and income. Every program is ranked for you, with the reason for its score." : `Search ${DB_STATS.programs} manufacturer programs by drug or condition, or browse by what they treat.`}</p>
          <div className="seg" role="tablist" aria-label="Search mode">
            {[["chat","Search programs",SearchIcon],["match","Check if I qualify",Gauge]].map(([t,l,Icon]) => (
              <button key={t} role="tab" aria-selected={tab===t} className={tab===t?"on":""} onClick={() => setTab(t)}><Icon size={16} aria-hidden="true" />{l}</button>
            ))}
          </div>
        </div>
      </header>
      <div className="search-body">
        {tab === "chat" && (
          <div>
            <div className="s-sticky">
              <div className="sbox">
                <form className="sform" role="search" onSubmit={e => { e.preventDefault(); if (!input.trim()) { inputRef.current?.focus(); return; } inputRef.current?.blur(); doSearch(input); }}>
                  <SearchField value={input} onChange={v => { setInput(v); setFocused(true); }} inputRef={inputRef} placeholder="Drug or condition…"
                    onFocus={() => setFocused(true)} onBlur={leaveSearch} onKeyDown={onFieldKey} />
                  <button type="submit" className="btn bp" disabled={loading}>{loading?"Searching…":"Search"}</button>
                </form>
                {sugg.length > 0 && (
                  <ul className="sugg" ref={suggRef} aria-label="Suggestions" onKeyDown={onSuggKey}>
                    {sugg.map(s => (
                      <li key={s.key}>
                        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => pick(s.label)} onBlur={leaveSearch}>
                          <span className="ic">{s.kind === "Medication" ? <Pill size={17} aria-hidden="true" /> : <Stethoscope size={17} aria-hidden="true" />}</span>
                          <span className="sugg-t"><Highlight text={s.label} query={input} /></span>
                          <small>{s.kind}</small>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="m-scroll-x cat-chips" role="group" aria-label="Browse by condition">
              {CATEGORIES.map(c => (
                <button key={c.key} type="button" className={`chip${cat===c.key && !searched ? " on" : ""}`} aria-pressed={cat===c.key && !searched}
                  onClick={() => { setSearched(""); setResults([]); setAiSummary(""); setInput(""); setTierF("all"); setCat(c.key); }}>{c.label}</button>
              ))}
            </div>
            {loading ? (<><p className="sr-only" role="status">Loading programs…</p>{isMobile ? <SkeletonRows /> : <SkeletonCards />}</>) : (
              <>
                <div className={AI_ENABLED && !fallback ? "ai-note" : "sr-only"} role="status">{aiSummary}</div>
                {noMatch && (
                  <div className="empty">
                    <h2>No program matches “{searched}” yet</h2>
                    <p>Try the brand name on the prescription label, the generic name, or the condition it treats. CureAid covers {DB_STATS.programs} programs for Tier 4 and Tier 5 specialty drugs, so common generics usually won’t appear.</p>
                    <div className="empty-actions">
                      <a className="btn bp" {...linkProps(() => setTab("match"), "search", { tab: "match" })}>Check if I qualify instead</a>
                      <button type="button" className="btn bo" onClick={() => { setSearched(""); setResults([]); setAiSummary(""); setInput(""); inputRef.current?.focus(); }}>Clear search</button>
                    </div>
                  </div>
                )}
                {catObj && !searched ? (
                  <div className="res-head">
                    <h2>{catObj.label}: {catObj.programs.length} programs</h2>
                    <div className="res-head-r">
                      <button type="button" className="link-btn" onClick={() => { setCat(null); setTierF("all"); }}><X size={14} aria-hidden="true" /> Clear</button>
                  {visible.length > 1 && (
                    <div className="sortf">
                      <label htmlFor="sort-by">Sort</label>
                      <select id="sort-by" name="sort" value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="best">{searched ? "Best match" : "Default"}</option>
                        <option value="price">Lowest price</option>
                      </select>
                      <ChevronDown size={16} aria-hidden="true" />
                    </div>
                  )}
                    </div>
                  </div>
                ) : (
                <div className="res-head">
                  <h2>{!searched ? "Popular programs" : noMatch ? "Programs you might explore" : `${results.length} program${results.length===1?"":"s"} for “${searched}”`}</h2>
                  <div className="res-head-r">
                    {(!searched || noMatch) && <span>{!searched ? "Search to narrow these down" : "Related to your search"}</span>}
                  {visible.length > 1 && (
                    <div className="sortf">
                      <label htmlFor="sort-by">Sort</label>
                      <select id="sort-by" name="sort" value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="best">{searched ? "Best match" : "Default"}</option>
                        <option value="price">Lowest price</option>
                      </select>
                      <ChevronDown size={16} aria-hidden="true" />
                    </div>
                  )}
                  </div>
                </div>
                )}
                {tiers.length > 1 && shown.length > 5 && (
                <div className="res-tools">
                  {(
                    <div className="tierf" role="group" aria-label="Filter by tier">
                      {["all", ...tiers].map(t => {
                        const n = t === "all" ? shown.length : shown.filter(p => String(p.tier) === t).length;
                        return <button key={t} type="button" className={`chip${tierOn===t?" on":""}`} aria-pressed={tierOn===t} onClick={() => setTierF(t)}>{t === "all" ? "All" : `Tier ${t}`} <span className="tierf-n">{n}</span></button>;
                      })}
                    </div>
                  )}
                </div>
                )}
                <ProgramList split items={visible.map(p => ({ psp: p }))} label="Programs" />
              </>
            )}
          </div>
        )}
        {tab === "match" && (
          <div>
            {matchResults.length === 0 && !matchLoading ? (
              <EligibilityQuiz profile={matchProfile} setProfile={setMatchProfile} onSubmit={doMatch} loading={matchLoading} />
            ) : (
              <>
                <div className="quiz-sum">
                  <p><span>Ranked for</span> <b>{matchProfile.condition}</b>{matchProfile.insurance && <>, <b>{matchProfile.insurance}</b></>}{matchProfile.income && <>, <b>{matchProfile.income.replace(/(\d)-(\$)/, "$1–$2")}</b></>}</p>
                  <button type="button" className="btn bo bsm" onClick={() => setMatchResults([])}>Change answers</button>
                </div>
                {matchLoading ? (<><p className="sr-only" role="status">Ranking programs…</p>{isMobile ? <SkeletonRows /> : <SkeletonCards />}</>) : (
                  <>
                    <div className="res-head"><h2>Your top {matchResults.length} programs</h2><span>Highest match first</span></div>
                    <ProgramList split items={matchResults.map(p => ({ psp: p, score: p.mlScore, reason: p.matchReason }))} label="Matched programs" />
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
const SUPPORT_GROUPS = [
  { name: "Multiple sclerosis", cat: "neuro", about: "Disease-modifying therapies, infusion schedules and specialty pharmacies." },
  { name: "Rheumatoid arthritis", cat: "joints", about: "Biologics, switching programs and step-therapy denials." },
  { name: "Crohn’s and colitis", cat: "gut", about: "Infusion and injection programs, travel and work." },
  { name: "Heart failure", cat: "heart", about: "Copay cards for newer heart medications and Medicare questions." },
  { name: "Skin conditions", cat: "skin", about: "Eczema, psoriasis and hidradenitis programs." },
  { name: "Cancer care", cat: "cancer", about: "Oral oncology programs, foundations and caregiver help." },
];

function Community({ user, setPage }) {
  const [tab, setTab] = useState("feed");
  const [newPost, setNewPost] = useState("");
  const [liked, setLiked] = useState({});
  const [posts, setPosts] = useState(COMMUNITY_POSTS);
  const [cond, setCond] = useState("All");
  const [joined, setJoined] = useState({});
  const [shared, setShared] = useState(null);
  const conditions = ["All", ...new Set(COMMUNITY_POSTS.map(p => p.condition))];
  const filtered = cond === "All" ? posts : posts.filter(p => p.condition === cond || p.condition === "General");
  const post = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosts(p => [{ id: Date.now(), author: user.name, condition: "General", avatar: user.name.slice(0, 2).toUpperCase(), time: "Just now", content: newPost.trim(), likes: 0, replies: 0, tag: "Question" }, ...p]);
    setNewPost("");
  };
  const share = (p) => {
    const url = `${window.location.origin}${window.location.pathname}#community`;
    if (navigator.share) { navigator.share({ title: "CureAid community", text: p.content.slice(0, 120), url }).catch(() => {}); return; }
    navigator.clipboard?.writeText(url).then(() => { setShared(p.id); setTimeout(() => setShared(null), 2000); });
  };
  return (
    <div className="page">
      <header className="pghead">
        <div className="pghead-in">
          <h1>Patient community</h1>
          <p>Tips, questions and approvals from people enrolling in the same programs as you.</p>
          <div className="seg" role="tablist" aria-label="Community view">
            {[["feed", "Discussion", MessagesSquare], ["groups", "Support groups", Users]].map(([t, l, Icon]) => (
              <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}><Icon size={16} aria-hidden="true" />{l}</button>
            ))}
          </div>
        </div>
      </header>
      <div className="pbody">
        {tab === "feed" && (
          <div className="cm">
            <div className="cm-main">
              {user ? (
                <form className="composer" onSubmit={post}>
                  <span className="pav2" aria-hidden="true">{user.name.slice(0, 2).toUpperCase()}</span>
                  <div className="composer-f">
                    <label htmlFor="cm-new" className="sr-only">Write a post</label>
                    <textarea id="cm-new" name="post" className="inp" rows={3} placeholder="Share a tip, an approval or a question…" value={newPost} onChange={e => setNewPost(e.target.value)} />
                    <div className="composer-r">
                      <small>Leave out member IDs, birth dates and anything else that identifies you.</small>
                      <button type="submit" className="btn bp" disabled={!newPost.trim()}>Post</button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="join-row">
                  <p><b>Join the conversation.</b> A free account lets you post and save programs.</p>
                  <a className="btn bp" {...linkProps(setPage, "signup")}>Create free account</a>
                </div>
              )}
              <div className="m-scroll-x cat-chips" role="group" aria-label="Filter by condition">
                {conditions.map(c => <button key={c} type="button" className={`chip${cond === c ? " on" : ""}`} aria-pressed={cond === c} onClick={() => setCond(c)}>{c === "All" ? "All conditions" : c}</button>)}
              </div>
              <p className="feed-note">These are example posts that show how the community works.</p>
              <ul className="feed">
                {filtered.map(p => (
                  <li key={p.id} className="fpost">
                    <span className="pav2" aria-hidden="true">{p.avatar}</span>
                    <div className="fpost-b">
                      <div className="fpost-h">
                        <b>{p.author}</b>
                        <span className={`ftag ftag-${p.tag.toLowerCase().replace(/\s+/g, "-")}`}>{p.tag}</span>
                        <time>{p.time}</time>
                      </div>
                      <small className="fpost-c">{p.condition}</small>
                      <p>{p.content}</p>
                      <div className="fpost-a">
                        <button type="button" className={`fact${liked[p.id] ? " on" : ""}`} aria-pressed={Boolean(liked[p.id])}
                          onClick={() => { setLiked(l => ({ ...l, [p.id]: !l[p.id] })); setPosts(ps => ps.map(x => x.id === p.id ? { ...x, likes: x.likes + (liked[p.id] ? -1 : 1) } : x)); }}>
                          <Heart size={17} aria-hidden="true" fill={liked[p.id] ? "currentColor" : "none"} /><span>{p.likes}</span><span className="sr-only"> likes</span>
                        </button>
                        <span className="fact fact-static"><MessageCircle size={17} aria-hidden="true" />{p.replies}<span className="sr-only"> replies</span></span>
                        <button type="button" className="fact" onClick={() => share(p)}><Share2 size={17} aria-hidden="true" /><span aria-live="polite">{shared === p.id ? "Link copied" : "Share"}</span></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <aside className="cm-aside" aria-label="Community guidelines and groups">
              <section className="aside-panel">
                <h2><ShieldCheck size={18} aria-hidden="true" />Before you post</h2>
                <ul className="rules">
                  <li>Don’t share member IDs, birth dates or your full name.</li>
                  <li>Share what worked for you, not medical advice.</li>
                  <li>Program terms change. Say when your experience happened.</li>
                </ul>
              </section>
              <section className="aside-panel">
                <h2>Support groups</h2>
                <ul className="aside-links">
                  {SUPPORT_GROUPS.slice(0, 4).map(g => <li key={g.name}><button type="button" onClick={() => setTab("groups")}>{g.name}<ChevronRight size={16} aria-hidden="true" /></button></li>)}
                </ul>
              </section>
              <section className="aside-panel aside-cta">
                <h2>Looking for a program?</h2>
                <p>Search {DB_STATS.programs} programs by drug or condition.</p>
                <a className="btn bo" {...linkProps(setPage, "search")}>Find programs</a>
              </section>
            </aside>
          </div>
        )}
        {tab === "groups" && (
          <div className="groups">
            <div className="sec-head">
              <h2 className="hm-h">Support groups</h2>
              <p className="hm-sub">Talk with people taking the same kind of medication. Groups are moderated and never ask for insurance details.</p>
            </div>
            <ul className="group-list">
              {SUPPORT_GROUPS.map(g => {
                const c = CATEGORIES.find(x => x.key === g.cat);
                const Icon = c?.icon || Users;
                return (
                  <li key={g.name}>
                    <span className="hood-ic"><Icon size={20} aria-hidden="true" /></span>
                    <div><h3>{g.name}</h3><p>{g.about}</p></div>
                    <button type="button" className={`btn ${joined[g.name] ? "bo" : "bp"}`} aria-pressed={Boolean(joined[g.name])}
                      onClick={() => user ? setJoined(j => ({ ...j, [g.name]: !j[g.name] })) : setPage("signup")}>
                      {joined[g.name] ? <><Check size={16} aria-hidden="true" />Joined</> : "Join group"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
function Dashboard({ user, setPage }) {
  if (!user) return (
    <div className="page">
      <div className="pbody">
        <div className="signed-out">
          <span className="hood-ic" aria-hidden="true"><LayoutDashboard size={22} /></span>
          <h1>Sign in to see your saved programs</h1>
          <p>Your dashboard keeps the programs you saved, your enrollment calls and your community posts in one place.</p>
          <div className="empty-actions">
            <a className="btn bp" {...linkProps(setPage, "login")}>Log in</a>
            <a className="btn bo" {...linkProps(setPage, "signup")}>Create free account</a>
          </div>
        </div>
      </div>
    </div>
  );
  const saved = PSP_DATABASE.slice(0, 2);
  const activity = [
    { text: "Started enrollment with Dupixent MyWay", time: "2 days ago", icon: Headset },
    { text: "Saved Genentech Access Solutions", time: "4 days ago", icon: Check },
    { text: "Posted in the multiple sclerosis group", time: "1 week ago", icon: Users },
    { text: "Searched for heart failure programs", time: "1 week ago", icon: SearchIcon },
  ];
  return (
    <div className="page">
      <header className="pghead">
        <div className="pghead-in">
          <h1>Welcome back, {user.name.split(" ")[0]}</h1>
          <p>Pick up where you left off.</p>
        </div>
      </header>
      <div className="pbody">
        <div className="cm">
          <div className="cm-main">
            <section aria-labelledby="dash-saved">
              <div className="res-head">
                <h2 id="dash-saved">Saved programs</h2>
                <div className="res-head-r"><a className="link-btn" {...linkProps(setPage, "search")}>Find more programs<ChevronRight size={16} aria-hidden="true" /></a></div>
              </div>
              <ProgramList items={saved.map(p => ({ psp: p }))} label="Saved programs" />
            </section>
            <section aria-labelledby="dash-act" className="dash-sec">
              <div className="res-head"><h2 id="dash-act">Recent activity</h2></div>
              <ol className="timeline">
                {activity.map(({ text, time, icon: Icon }) => (
                  <li key={text}><span className="tl-ic" aria-hidden="true"><Icon size={15} /></span><span className="tl-t">{text}</span><time>{time}</time></li>
                ))}
              </ol>
            </section>
          </div>
          <aside className="cm-aside" aria-label="Your account">
            <section className="aside-panel acct">
              <span className="pav2 pav-lg" aria-hidden="true">{user.name.slice(0, 2).toUpperCase()}</span>
              <div><b>{user.name}</b><small>{user.email}</small></div>
            </section>
            <section className="aside-panel">
              <h2>Next steps</h2>
              <ul className="aside-links">
                {[["Prepare for an enrollment call", "coach", null], ["Check if I qualify for more", "search", { tab: "match" }], ["Appeal an insurance denial", "ailab", { tab: "f4" }], ["Visit the community", "community", null]].map(([l, p, seed]) => (
                  <li key={l}><a {...linkProps(setPage, p, seed)}>{l}<ChevronRight size={16} aria-hidden="true" /></a></li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function About({ setPage }) {
  const does = [
    "Collects each program’s terms, eligibility, phone number and hours in one place",
    "Rewrites eligibility rules in plain English",
    "Helps you prepare for the enrollment call and appeal an insurance denial",
  ];
  const doesnt = [
    "Take payment from drugmakers or rank programs for money",
    "Enroll you itself. Every enrollment link goes to the drugmaker’s own site",
    "Give medical advice or replace your doctor or pharmacist",
  ];
  const values = [
    ["Patients first", "Every decision starts with one question: does this help someone get the medication they were prescribed?"],
    ["Plain about what we know", "We show where each fact comes from, say when terms may have changed, and never hide a fee. There are none."],
    ["Speed matters", "Someone who waits three months to find help may stop their medication. Getting to the right program fast is the point."],
    ["Equal access", "Specialty medication shouldn’t depend on knowing where to look. CureAid is free and needs no account to search."],
  ];
  const goals = [
    "Help people facing high costs for specialty medication find the assistance that already exists for them.",
    "Make enrolling in a manufacturer program simple enough to finish in one call.",
    "Raise awareness of support program funds that go unused each year.",
    "Keep every program’s details current as manufacturers change their terms.",
  ];
  return (
    <div className="page">
      <header className="pghead about-head">
        <div className="pghead-in">
          <h1>No one should miss a medication because they didn’t know help existed.</h1>
          <p>CureAid is a free, independent guide to the support programs drugmakers run for Tier 4 and Tier 5 specialty medications. It was started by patients, for patients.</p>
        </div>
      </header>
      <div className="pbody about">
        <section className="ab-row" aria-labelledby="ab-mission">
          <h2 id="ab-mission">Our mission</h2>
          <div className="ab-copy">
            <p className="ab-lead">To help every eligible patient with a Tier 4 or Tier 5 condition get the financial support and information they need to stay on their medication, whatever their income.</p>
            <p>Drugmakers fund support programs that can bring a $1,000-a-month prescription down to $0. Most patients never hear about them, and those who do face legal eligibility rules, phone trees and paperwork. CureAid puts every program in one place, explains it plainly and walks you through enrolling.</p>
          </div>
        </section>
        <section className="ab-row" aria-labelledby="ab-what">
          <h2 id="ab-what">What CureAid does, and doesn’t do</h2>
          <div className="ab-cols">
            <div>
              <h3>CureAid does</h3>
              <ul className="ab-list">{does.map(t => <li key={t}><CircleCheck size={18} aria-hidden="true" />{t}</li>)}</ul>
            </div>
            <div>
              <h3>CureAid doesn’t</h3>
              <ul className="ab-list no">{doesnt.map(t => <li key={t}><X size={18} aria-hidden="true" />{t}</li>)}</ul>
            </div>
          </div>
        </section>
        <section className="ab-row" aria-labelledby="ab-values">
          <h2 id="ab-values">What we value</h2>
          <dl className="ab-values">
            {values.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}
          </dl>
        </section>
        <section className="ab-row" aria-labelledby="ab-goals">
          <h2 id="ab-goals">Our goals</h2>
          <ul className="ab-list ab-goals">{goals.map(g => <li key={g}><Check size={18} aria-hidden="true" />{g}</li>)}</ul>
        </section>
      </div>
      <section className="closing" aria-labelledby="ab-close">
        <Guilloche big className="closing-art" />
        <div className="closing-in">
          <h2 id="ab-close" className="closing-h">Find your support program.</h2>
          <p>Search {DB_STATS.programs} programs from {DB_STATS.manufacturers} manufacturers. Free, with no account needed.</p>
          <div className="closing-actions">
            <a className="btn bp blg" {...linkProps(setPage, "search")}>Search programs</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function AILab({ seed }) {
  const [activeTab, setActiveTab] = useState(seed?.tab || "overview");
  const [f4Form, setF4Form] = useState({ drug:"", program:"", condition:"", insurance:"", denial:"" });
  const [f4Letter, setF4Letter] = useState("");
  const [f4Loading, setF4Loading] = useState(false);
  const [f4Err, setF4Err] = useState("");
  const [f4Copied, setF4Copied] = useState(false);
  const insuranceOptions = ["No insurance (uninsured)","Commercial / employer insurance","Medicare","Medicaid","Medicare + Medicaid (dual)","Underinsured (high out-of-pocket)"];
  const runF4 = async () => {
    if (!f4Form.drug || !f4Form.denial) return;
    setF4Loading(true); setF4Letter("");
    const letter = await aiAppealLetter(f4Form.drug, f4Form.program||"manufacturer support program", f4Form.denial, f4Form.condition||"chronic condition", f4Form.insurance||"my insurance");
    setF4Letter(letter); setF4Loading(false);
  };
  return (
    <div className="page">
      <header className="pghead">
        <div className="pghead-in">
          <h1>Costs & appeals</h1>
          <p>Tools for the harder parts: estimating what you’ll really pay in a year, and writing an appeal when insurance says no.</p>
          <div className="seg" role="tablist" aria-label="Cost and appeal tools">
            {[["overview","Cost estimate",Calculator],["f4","Appeal letter",FileText]].map(([t,l,Icon]) => (
              <button key={t} role="tab" aria-selected={activeTab===t} className={activeTab===t?"on":""} onClick={() => setActiveTab(t)}><Icon size={16} aria-hidden="true" />{l}</button>
            ))}
          </div>
        </div>
      </header>
      <div className="pbody">
        {activeTab === "overview" && (
          <div>
            <section className="panel sim-panel" aria-labelledby="sim-title">
              <h2 id="sim-title" className="panel-h">Estimate my yearly cost</h2>
              <p className="panel-p">Enter three numbers from your plan to see, month by month, what you’d pay with a copay card, and whether your plan lets the card count toward your out-of-pocket maximum.</p>
              <CostSimulator />
            </section>
            <section className="dash-sec" aria-labelledby="tools-title">
              <div className="sec-head"><h2 id="tools-title" className="hm-h">More tools</h2></div>
              <ul className="hood-list">
                {[
                  ["Appeal letter", "Describe why your insurance denied a medication and get a draft letter for your doctor to review.", "Open", FileText, () => setActiveTab("f4")],
                  ["Approval check", "Before you call, see how likely a program is to approve you, based on your answers in the enrollment coach.", "Open", Gauge, null],
                ].map(([t, d, cta, Icon, go]) => (
                  <li key={t}>
                    <span className="hood-ic"><Icon size={20} aria-hidden="true" /></span>
                    <div><h3>{t}</h3><p>{d}</p></div>
                    {go ? <button type="button" className="btn bo" onClick={go}>{cta}</button> : <a className="btn bo" href={hrefFor("coach")}>{cta}</a>}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
        {activeTab === "f4" && (
          <div>
            <div className="panel f4-panel">
              <h2 className="panel-h">Appeal an insurance denial</h2>
              <p className="panel-p">If your insurance denied a specialty medication, describe the denial and get a draft appeal letter to review with your doctor.</p>
              <div className="f4-grid">
                <div className="fg"><label className="lbl" htmlFor="f4-drug">Medication</label><input id="f4-drug" name="medication" autoComplete="off" list="c-drug-list-f4" className="inp" placeholder="e.g. Dupixent…" aria-invalid={f4Err && !f4Form.drug ? true : undefined} value={f4Form.drug} onChange={e => setF4Form(f=>({...f,drug:e.target.value}))} /><datalist id="c-drug-list-f4">{DRUG_NAMES.map(d => <option key={d} value={d} />)}</datalist></div>
                <div className="fg"><label className="lbl" htmlFor="f4-prog">Support program <span className="opt">optional</span></label><input id="f4-prog" name="program" autoComplete="off" className="inp" placeholder="e.g. Dupixent MyWay…" value={f4Form.program} onChange={e => setF4Form(f=>({...f,program:e.target.value}))} /></div>
                <div className="fg"><label className="lbl" htmlFor="f4-cond">Condition</label><input id="f4-cond" name="condition" autoComplete="off" className="inp" placeholder="e.g. Atopic dermatitis…" value={f4Form.condition} onChange={e => setF4Form(f=>({...f,condition:e.target.value}))} /></div>
                <div className="fg"><label className="lbl" htmlFor="f4-ins">Insurance</label><select id="f4-ins" name="insurance" className="inp" value={f4Form.insurance} onChange={e => setF4Form(f=>({...f,insurance:e.target.value}))}><option value="">Select…</option>{insuranceOptions.map(o=><option key={o}>{o}</option>)}</select></div>
              </div>
              <div className="fg f4-denial"><label className="lbl" htmlFor="f4-denial">Reason your insurance gave for the denial</label><input id="f4-denial" name="denial-reason" autoComplete="off" className="inp" placeholder="e.g. Not medically necessary…" aria-invalid={f4Err && !f4Form.denial ? true : undefined} aria-describedby={f4Err ? "f4-err" : undefined} value={f4Form.denial} onChange={e => setF4Form(f=>({...f,denial:e.target.value}))} /></div>
              {f4Err && <p id="f4-err" className="q-err f4-err" role="alert">{f4Err}</p>}
              <button type="button" className="btn bp" onClick={() => { if (!f4Form.drug || !f4Form.denial) { setF4Err(`Add the ${!f4Form.drug ? "medication" : ""}${!f4Form.drug && !f4Form.denial ? " and the " : ""}${!f4Form.denial ? "denial reason" : ""} to write your letter.`); document.getElementById(!f4Form.drug ? "f4-drug" : "f4-denial")?.focus(); return; } setF4Err(""); runF4(); }} disabled={f4Loading}>{f4Loading?"Writing your appeal letter…":"Write my appeal letter"}</button>
            </div>
            {f4Loading && <div className="f4-wait" role="status"><div className="dots"><span/><span/><span/></div><p>Writing your appeal letter…</p></div>}
            {f4Letter && (
              <div className="panel letter fu">
                <div className="letter-h">
                  <h3>Your appeal letter</h3>
                  <button type="button" className="btn bo" onClick={() => navigator.clipboard?.writeText(f4Letter).then(() => { setF4Copied(true); setTimeout(() => setF4Copied(false), 2000); })}>
                    {f4Copied ? <><Check size={16} aria-hidden="true" />Copied</> : <><Copy size={16} aria-hidden="true" />Copy letter</>}
                  </button>
                </div>
                <div className="letter-body">{f4Letter}</div>
                <p className="letter-note">Review with your doctor before submitting.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
function CostSimulator() {
  const [step, setStep] = useState(1);
  const [showDetail, setShowDetail] = useState(false);
  const [monthlyShare, setMonthlyShare] = useState(748);
  const [deductible, setDeductible] = useState(3000);
  const [oop, setOop] = useState(7000);
  const [accumulator, setAccumulator] = useState("no");
  const cardMax = 13000;
  const fmt = n => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Math.round(n));
  const calculate = () => {
    const hasAcc = accumulator === "yes";
    let months = [], oopCounter = 0, cardUsed = 0, dedRemaining = deductible;
    for (let m = 1; m <= 12; m++) {
      let share = 0, status = "";
      if (oopCounter >= oop) { status = "oop_hit"; share = 0; }
      else {
        if (dedRemaining > 0) { const dp = Math.min(dedRemaining,3742); const od = Math.max(0,3742-dp); share = dp+od*(monthlyShare/3742); dedRemaining -= dp; }
        else { share = monthlyShare; }
        share = Math.min(share, oop-oopCounter);
        if (hasAcc) {
          if (cardUsed+share <= cardMax) { cardUsed += share; status = "card_blocked"; }
          else { const left = Math.max(0,cardMax-cardUsed); cardUsed = cardMax; share = share-left; oopCounter += share; status = share>0?"you_pay":"card_blocked"; }
        } else {
          if (cardUsed+share <= cardMax) { cardUsed += share; oopCounter += share; status = oopCounter>=oop?"oop_hit":"card_counts"; }
          else { oopCounter += share; status = "you_pay"; }
        }
      }
      months.push({ m, share: Math.round(share), status, oopCounter: Math.round(oopCounter), cardUsed: Math.round(cardUsed) });
    }
    const totalYouPay = months.reduce((s,r) => s+(r.status==="you_pay"?r.share:0), 0);
    const oopHitMonth = months.find(r => r.oopCounter >= oop);
    const freeMonths = oopHitMonth ? 12-oopHitMonth.m : 0;
    return { months, totalYouPay, oopHitMonth, freeMonths, cardUsed };
  };
  const result = step >= 2 ? calculate() : null;
  const STATUS = {
    oop_hit: { cls: "free", label: "Free", long: "Insurance covers 100%" },
    card_counts: { cls: "free", label: "$0", long: "Card pays and counts toward your maximum" },
    card_blocked: { cls: "warn", label: "$0", long: "Card pays, but your plan doesn’t count it" },
    you_pay: { cls: "pay", label: "You pay", long: "Card used up, you pay" },
  };
  const accOpts = [
    ["no", "No", "The card counts toward my maximum"],
    ["yes", "Yes", "My plan has an accumulator or maximizer"],
    ["unknown", "Not sure", "We’ll assume it counts, and show how to check"],
  ];
  return (
    <div className="sim">
      <form className="sim-form" onSubmit={e => { e.preventDefault(); setStep(2); }}>
        <div className="sim-fields">
          {[["sim-share", "Monthly cost-share for the drug", "Your coinsurance or copay each month", monthlyShare, setMonthlyShare], ["sim-ded", "Yearly deductible", "On your insurance card or plan summary", deductible, setDeductible], ["sim-oop", "Out-of-pocket maximum", "The most you pay in a year", oop, setOop]].map(([fid, label, hint, val, setter]) => (
            <div className="fg" key={fid}>
              <label className="lbl" htmlFor={fid}>{label}</label>
              <p className="sim-hint" id={`${fid}-hint`}>{hint}</p>
              <div className="money-inp">
                <span aria-hidden="true">$</span>
                <input id={fid} name={fid} className="inp" type="number" inputMode="numeric" min="0" autoComplete="off" aria-describedby={`${fid}-hint`} value={val} onChange={e => setter(Number(e.target.value) || 0)} />
              </div>
            </div>
          ))}
        </div>
        <RadioCards name="sim-acc" legend="Does your plan have a copay accumulator?" hint="Some plans stop copay card payments from counting toward your deductible and maximum. Your plan documents or member services can tell you."
          options={accOpts} value={accumulator} onChange={setAccumulator} />
        <button type="submit" className="btn bp">{step >= 2 ? "Update my estimate" : "Show my costs"}</button>
      </form>
      {result && (
        <div className="sim-out" aria-live="polite">
          <h3 className="sim-h">Your year, month by month</h3>
          <ol className="months">
            {result.months.map(mo => {
              const st = STATUS[mo.status] || { cls: "", label: "–", long: "" };
              return <li key={mo.m} className={`mo mo-${st.cls}`}><b>{st.label}</b><small><span className="mo-w">Month </span>{mo.m}</small><span className="sr-only">: {st.long}{mo.status === "you_pay" && mo.share > 0 ? `, you pay ${fmt(mo.share)}` : ""}</span></li>;
            })}
          </ol>
          <ul className="mo-key" aria-hidden="true">
            <li><span className="mo-sw mo-free" />Card or insurance covers it</li>
            {accumulator === "yes" && <li><span className="mo-sw mo-warn" />Card pays, plan doesn’t count it</li>}
            <li><span className="mo-sw mo-pay" />You pay</li>
          </ul>
          <dl className="sim-sum">
            <div><dt>You pay for the drug this year</dt><dd className={result.totalYouPay === 0 ? "good" : "bad"}>{fmt(result.totalYouPay)}</dd><dd className="sim-note">{result.totalYouPay === 0 ? "The card covers your pharmacy bill every month." : "What you still owe after the card runs out."}</dd></div>
            <div><dt>Doctor visits, labs and other prescriptions</dt><dd className={result.freeMonths > 0 ? "good" : "warn"}>{result.freeMonths > 0 ? "$0" : "Coinsurance"}</dd><dd className="sim-note">{result.freeMonths > 0 ? `Covered in full for the last ${result.freeMonths} months, after you reach your maximum in month ${result.oopHitMonth ? result.oopHitMonth.m : "–"}.` : "You don’t reach your maximum this year, so your usual share applies."}</dd></div>
            <div><dt>The copay card pays</dt><dd>{fmt(result.cardUsed)}</dd><dd className="sim-note">{fmt(cardMax - result.cardUsed)} of the {fmt(cardMax)} yearly limit left.</dd></div>
          </dl>
          {accumulator !== "yes" && <div className="note-ok"><b>Your plan works with the copay card.</b> Every dollar the card pays counts toward your {fmt(oop)} maximum{result.oopHitMonth ? `, so you reach it in month ${result.oopHitMonth.m}` : ""}. After that, insurance covers your care in full for the rest of the year.{accumulator === "unknown" && " Ask member services whether your plan has an accumulator to be sure."}</div>}
          {accumulator === "yes" && <div className="note-warn"><b>Your plan has an accumulator.</b> The card still pays for the drug, but those payments don’t count toward your maximum. If your income qualifies, the manufacturer’s free-drug program may cost you less.</div>}
          <button type="button" className="btn bo sim-more" aria-expanded={showDetail} onClick={() => setShowDetail(!showDetail)}>{showDetail ? "Hide month-by-month table" : "Show month-by-month table"}<ChevronDown size={16} aria-hidden="true" style={{ transform: showDetail ? "rotate(180deg)" : undefined }} /></button>
          {showDetail && (
            <div className="tbl-wrap" tabIndex={0} role="region" aria-label="Month-by-month costs">
              <table className="tbl">
                <thead><tr><th scope="col">Month</th><th scope="col">What happens</th><th scope="col">Card pays</th><th scope="col">You pay</th><th scope="col">Toward maximum</th></tr></thead>
                <tbody>
                  {result.months.map(mo => (
                    <tr key={mo.m}>
                      <td>{mo.m}</td>
                      <td>{(STATUS[mo.status] || {}).long}</td>
                      <td>{mo.status === "card_counts" || mo.status === "card_blocked" ? fmt(mo.share) : "$0"}</td>
                      <td className={mo.status === "you_pay" && mo.share > 0 ? "bad" : ""}>{mo.status === "you_pay" ? fmt(mo.share) : "$0"}</td>
                      <td>{fmt(mo.oopCounter)}{mo.oopCounter >= oop && <Check size={14} aria-label="Maximum reached" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function EnrollmentCoach() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ drug:"", program:"", condition:"", income:"", insurance:"", hasAccumulator:"unknown" });
  const [briefing, setBriefing] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [agentQuestion, setAgentQuestion] = useState("");
  const [, setCoachResponse] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [myAnswer, setMyAnswer] = useState("");
  const [dangerCheck, setDangerCheck] = useState(null);
  const [dangerLoading, setDangerLoading] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const chatRef = useRef(null);
  const setP = (k,v) => setProfile(p=>({...p,[k]:v}));
  const incomeOpts = ["Under $25,000","$25,000-$50,000","$50,000-$75,000","$75,000-$100,000","Over $100,000"];
  const insuranceOpts = ["No insurance","Commercial / employer","Medicare","Medicaid","Medicare + Medicaid","Underinsured"];
  const getBriefing = async () => {
    if (!profile.drug||!profile.condition||!profile.income||!profile.insurance) return;
    setBriefingLoading(true);
    const text = await aiBriefing(profile);
    setBriefing(text); setBriefingLoading(false);
  };
  const askCoach = async (question = agentQuestion) => {
    if (!question.trim()) return;
    setCoachLoading(true);
    const text = await aiCoachAnswer(question, profile, chatHistory);
    setChatHistory(h => [...h,{role:"Agent",text:question},{role:"Coach",text}]);
    setCoachResponse(text); setAgentQuestion(""); setCoachLoading(false);
    setTimeout(()=>chatRef.current&&chatRef.current.scrollTo({top:9999,behavior:"smooth"}),100);
  };
  // A question from the call plan already has a prepared answer; show it at once instead of asking again.
  const askPlanned = (q, a) => {
    if (!a) { askCoach(q); return; }
    setChatHistory(h => [...h, { role: "Agent", text: q }, { role: "Coach", text: a }]);
    setTimeout(()=>chatRef.current&&chatRef.current.scrollTo({top:9999,behavior:"smooth"}),100);
  };
  const checkAnswer = async () => {
    if (!myAnswer.trim()) return;
    setDangerLoading(true);
    const text = await aiDangerCheck(myAnswer, profile);
    setDangerCheck({answer:myAnswer,result:text}); setMyAnswer(""); setDangerLoading(false);
  };
  const verdictTone = t => !t ? "" : t.startsWith("SAFE") ? "safe" : t.startsWith("CAUTION") ? "caution" : "risk";
  const [formErr, setFormErr] = useState("");
  const headRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  const goStep = (n) => { if (n === 3) setCallOn(true); setStep(n); setTimeout(() => headRef.current?.focus(), 0); };
  const submitProfile = (e) => {
    e.preventDefault();
    const missing = [!profile.drug && "medication", !profile.condition && "condition", !profile.insurance && "insurance", !profile.income && "income"].filter(Boolean);
    if (missing.length) { setFormErr(`Add your ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")} to make your call plan.`); return; }
    setFormErr(""); goStep(2); if (!briefing) getBriefing();
  };
  const steps = ["Your details", "Your call plan", "On the call"];
  const tel = profile.drug.toLowerCase().includes("dupixent") ? "18443874936" : "";
  const match = PSP_DATABASE.find(p => profile.drug && p.drugName.toLowerCase().startsWith(profile.drug.toLowerCase().trim()));
  const progName = profile.program || match?.programName?.split(" / ")[0] || `the ${profile.drug || "program"} support line`;
  const callPhone = tel ? "1-844-387-4936" : match?.phone || "";
  const callHours = match?.hours ? match.hours.replace(/(\w)-(\w)/g, "$1–$2") : "";
  // The questions from the call plan, each with its prepared answer, become one-tap buttons on the call.
  const plannedQs = (() => {
    const sec = parseBriefing(briefing || "")?.find(x => x.title.toLowerCase().startsWith("questions"));
    return (sec?.items || []).map(it => { const [q, ...a] = it.split(/\s+[—–-]\s+/); return { q: q.replace(/^["“]|["”]$/g, ""), a: a.join(" – ") }; }).slice(0, 7);
  })();
  // Call timer: starts the first time "On the call" opens; ending the call freezes the time.
  const callEnded = Boolean(outcome);
  // The call keeps going while you look back at the plan; only End call (or starting over) stops it.
  const [callOn, setCallOn] = useState(false);
  useEffect(() => {
    if (!callOn || callEnded) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [callOn, callEnded]);
  const outcomeRef = useRef(null);
  const endCall = () => { setOutcome("pending"); setTimeout(() => { outcomeRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }); outcomeRef.current?.querySelector("button")?.focus({ preventScroll: true }); }, 0); };
  const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const outcomes = [["approved","Approved"],["denied","Denied"],["pending2","Decision pending"],["callback","They’ll call me back"],["moreinfo","They need more documents"]];
  return (
    <div className="page">
      <header className="pghead">
        <div className="pghead-in">
          <h1>Call coach</h1>
          <p>Get ready for the call to the program: what to have on hand, what they’ll ask, and what to say. Then get help in real time while you’re on the phone.</p>
          <ol className="stepper">
            {steps.map((l, i) => {
              const n = i + 1, state = step > n ? "done" : step === n ? "now" : "next";
              const canGo = n < step || (n === 3 && briefing);
              return (
                <li key={l} className={`st-${state}`} aria-current={state === "now" ? "step" : undefined}>
                  <button type="button" disabled={!canGo} onClick={() => goStep(n)}>
                    <span className="st-n" aria-hidden="true">{state === "done" ? <Check size={14} /> : n}</span>
                    <span className="st-l">{l}<span className="sr-only">{state === "done" ? ", completed" : state === "now" ? ", current step" : ""}</span></span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </header>
      <div className="coach-body">
        {step === 1 && (
          <div className="cm coach-1">
          <form className="panel coach-form" onSubmit={submitProfile} noValidate>
            <h2 ref={headRef} tabIndex={-1} className="panel-h">Tell us about the medication</h2>
            <p className="panel-p">Your call plan is written for this program and your situation.</p>
            <div className="coach-fields">
              <div className="fg"><label className="lbl" htmlFor="c-drug">Medication</label><input id="c-drug" name="medication" className="inp" list="c-drug-list" autoComplete="off" placeholder="e.g. Dupixent…" value={profile.drug} onChange={e=>setP("drug",e.target.value)} /><datalist id="c-drug-list">{DRUG_NAMES.map(d => <option key={d} value={d} />)}</datalist></div>
              <div className="fg"><label className="lbl" htmlFor="c-prog">Support program <span className="opt">optional</span></label><input id="c-prog" name="program" autoComplete="off" className="inp" placeholder={match ? `${match.programName}…` : "e.g. Dupixent MyWay…"} value={profile.program} onChange={e=>setP("program",e.target.value)} /></div>
              <div className="fg"><label className="lbl" htmlFor="c-cond">Condition</label><input id="c-cond" name="condition" className="inp" list="c-cond-list" autoComplete="off" placeholder="e.g. Atopic dermatitis…" value={profile.condition} onChange={e=>setP("condition",e.target.value)} /><datalist id="c-cond-list">{CONDITION_NAMES.map(c => <option key={c} value={c} />)}</datalist></div>
            </div>
            <RadioCards name="c-ins" legend="Insurance" options={insuranceOpts} value={profile.insurance} onChange={v=>setP("insurance",v)} />
            <RadioCards name="c-inc" legend="Yearly household income" options={incomeOpts} value={profile.income} onChange={v=>setP("income",v)} />
            <RadioCards name="c-acc" legend="Does your plan have a copay accumulator?" hint="An accumulator stops copay-card payments from counting toward your deductible. Your plan documents or member services can tell you."
              options={[["unknown","I don’t know"],["yes","Yes"],["no","No"]]} value={profile.hasAccumulator} onChange={v=>setP("hasAccumulator",v)} />
            {formErr && <p className="q-err" role="alert">{formErr}</p>}
            <div className="panel-actions"><button type="submit" className="btn bp blg">Make my call plan</button></div>
          </form>
          <aside className="cm-aside" aria-label="What your call plan includes">
            <section className="aside-panel">
              <h2>Your call plan includes</h2>
              <ul className="rules">
                <li>A checklist of documents to have in front of you</li>
                <li>The questions the program will ask, with what to say</li>
                <li>Mistakes that slow down approval</li>
                <li>Help in real time while you’re on the phone</li>
              </ul>
            </section>
            <section className="aside-panel">
              <h2><Phone size={18} aria-hidden="true" />Before you call</h2>
              <p>Each program’s phone hours are on its page, and most answer on weekdays. Call from somewhere you can reach your insurance card and last year’s tax return.</p>
            </section>
          </aside>
          </div>
        )}
        {step === 2 && (
          <div className="coach-plan">
            <div className="plan-sum">
              <dl>
                {[["Medication",profile.drug],["Program",profile.program||match?.programName||"Support program"],["Condition",profile.condition],["Insurance",profile.insurance],["Income",profile.income.replace(/(\d)-(\$)/, "$1–$2")]].map(([k,v])=>(
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
              <button type="button" className="btn bo bsm" onClick={()=>goStep(1)}>Edit details</button>
            </div>
            <h2 ref={headRef} tabIndex={-1} className="panel-h">Your call plan</h2>
            {briefingLoading || !briefing ? (
              <div className="panel" role="status">
                <p className="panel-p">{briefingLoading ? "Writing your call plan…" : "Your call plan isn’t ready."}</p>
                {!briefingLoading && <button type="button" className="btn bp" onClick={getBriefing}>Make my call plan</button>}
              </div>
            ) : (
              <>
                <Briefing text={briefing} />
                <div className="call-card">
                  <div>
                    <h3>When you’re ready, call {profile.program || match?.programName || `the ${profile.drug} support program`}</h3>
                    <p>{tel ? "1-844-DUPIXENT (1-844-387-4936), option 1. Monday to Friday, 8 am to 9 pm ET." : match?.phone ? `${match.phone}. ${match.hours || ""}` : "Use the phone number on the program’s enrollment page."}</p>
                  </div>
                  <div className="call-actions">
                    {(tel || match?.phone) && <a className="btn bo" href={`tel:${tel || match.phone.replace(/[^\d+]/g, "")}`}><Phone size={17} aria-hidden="true" /> Call</a>}
                    <button type="button" className="btn bp" onClick={()=>goStep(3)}>Start the call coach</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {step === 3 && (
          <div className="oncall">
            <div className={`callbar${callEnded ? " ended" : ""}`}>
              <div className="callbar-id">
                <span className="callbar-dot" aria-hidden="true" />
                <div>
                  <small>{callEnded ? "Call ended with" : "On the call with"}</small>
                  <b>{progName}</b>
                </div>
              </div>
              {callPhone && <a className="callbar-phone" href={`tel:${callPhone.replace(/[^\d+]/g, "")}`}><Phone size={17} aria-hidden="true" />{callPhone}</a>}
              {callHours && <span className="callbar-hours">{callHours}</span>}
              <span className="callbar-time" role="timer" aria-label={`${callEnded ? "Call lasted" : "Call time"} ${fmtTime(elapsed)}`}>{fmtTime(elapsed)}</span>
              <div className="callbar-r">
                <button type="button" className="btn bo" onClick={()=>goStep(2)}>Back to call plan</button>
                {!callEnded && <button type="button" className="btn bp" onClick={endCall}>End call</button>}
              </div>
            </div>
            <h2 ref={headRef} tabIndex={-1} className="sr-only">On the call</h2>
            <div className="oncall-grid">
              <section className="panel oncall-main" aria-labelledby="live-chat-h">
                <h3 id="live-chat-h" className="oncall-h">What did they just ask?</h3>
                {plannedQs.length > 0 && (
                  <div className="oncall-chips" role="group" aria-label="Questions from your call plan">
                    {plannedQs.map(({ q, a }) => {
                      const asked = chatHistory.some(m => m.role === "Agent" && m.text === q);
                      return <button key={q} type="button" className={`chip${asked ? " asked" : ""}`} onClick={() => askPlanned(q, a)}>{asked && <Check size={14} aria-hidden="true" />}{q}{asked && <span className="sr-only"> (answered)</span>}</button>;
                    })}
                  </div>
                )}
                {chatHistory.length > 0 ? (
                  <div ref={chatRef} className="say-list" aria-live="polite">
                    {chatHistory.reduce((pairs, m, i) => (m.role === "Agent" ? [...pairs, [m, chatHistory[i + 1]]] : pairs), []).map(([qm, am], i, arr) => (
                      <article key={i} className={`say${i === arr.length - 1 ? " latest" : ""}`}>
                        <p className="say-q">They asked: {qm.text}</p>
                        {am ? <><small className="say-k">Say this</small><p className="say-a">{am.text}</p></> : <p className="say-wait">Writing a suggested answer…</p>}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="oncall-empty">Tap one of the questions above when they ask it, or type what they said. You’ll get a short answer, in large type, to read out.</p>
                )}
                <form className="ask-row" onSubmit={e => { e.preventDefault(); agentQuestion.trim() ? askCoach() : document.getElementById("c-ask")?.focus(); }}>
                  <label className="sr-only" htmlFor="c-ask">The agent’s question</label>
                  <textarea id="c-ask" name="agent-question" className="inp" rows={2} placeholder="e.g. What is your household income?…" value={agentQuestion} onChange={e=>setAgentQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&agentQuestion.trim()){e.preventDefault();askCoach();}}} />
                  <button type="submit" className="btn bp" disabled={coachLoading}>{coachLoading ? "Suggesting…" : "Suggest an answer"}</button>
                </form>
              </section>
              <aside className="oncall-aside" aria-label="Your details and answer check">
                <section className="panel">
                  <h3 className="oncall-h">Your details, ready to read</h3>
                  <dl className="ready">
                    {[["Medication", profile.drug], ["Condition", profile.condition], ["Insurance", profile.insurance], ["Household income", profile.income.replace(/(\d)-(\$)/, "$1–$2")]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                  </dl>
                </section>
                <section className="panel" aria-labelledby="live-check-h">
                  <h3 id="live-check-h" className="oncall-h">Check an answer before you say it</h3>
                  <p className="panel-p">Some answers can hurt your eligibility. Type what you plan to say.</p>
                  <label className="sr-only" htmlFor="c-mine">What you plan to say</label>
                  <textarea id="c-mine" name="my-answer" className="inp" rows={2} placeholder="e.g. I just want it cheaper…" value={myAnswer} onChange={e=>setMyAnswer(e.target.value)} />
                  <button type="button" className="btn bo" onClick={() => myAnswer.trim() ? checkAnswer() : document.getElementById("c-mine")?.focus()} disabled={dangerLoading}>{dangerLoading?"Checking…":"Check my answer"}</button>
                  {dangerCheck && (
                    <div className={`verdict verdict-${verdictTone(dangerCheck.result)}`} role="status">
                      <span className="verdict-q">You planned to say: “{dangerCheck.answer}”</span>
                      <p>{dangerCheck.result}</p>
                    </div>
                  )}
                </section>
              </aside>
            </div>
            {outcome==="pending"&&(
              <fieldset className="panel outcome" ref={outcomeRef}>
                <legend className="live-h">How did the call go?</legend>
                <div className="outcome-opts">{outcomes.map(([v,l])=><button key={v} type="button" className="btn bo" onClick={()=>setOutcome(v)}>{l}</button>)}</div>
              </fieldset>
            )}
            {outcome&&outcome!=="pending"&&(
              <div className={`panel outcome-done ${outcome==="approved"?"ok":""}`} role="status">
                <h3 className="live-h">
                  {outcome==="approved"&&"Approved. Your medication help starts soon."}
                  {outcome==="denied"&&"Denied. Denials are often overturned on appeal."}
                  {outcome==="pending2"&&"Decision pending. Watch your email and mail for 5–10 business days."}
                  {outcome==="callback"&&"They’ll call you back, usually within 1–3 business days."}
                  {outcome==="moreinfo"&&"They need more documents. Gather them and call back; you’re close."}
                </h3>
                <p className="panel-p">
                  {outcome==="denied"&&"Use the appeal letter tool in Costs & appeals to draft a letter for your doctor to review."}
                  {outcome==="approved"&&"Write down your case manager’s name and number, and set a reminder 11 months from today to reapply."}
                  {(outcome==="pending2"||outcome==="callback"||outcome==="moreinfo")&&"If you don’t hear back within 5 business days, call the program line again."}
                </p>
                <button type="button" className="btn bo bsm" onClick={()=>{setElapsed(0);setCallOn(false);setStep(1);setOutcome(null);setChatHistory([]);setCoachResponse(null);setDangerCheck(null);setBriefing(null);}}>Start a new enrollment</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AuthPanel({ title, points }) {
  return (
    <div className="au-side">
      <Guilloche big className="au-art" />
      <div className="au-cards" aria-hidden="true">
        {HOME_EXAMPLES.map((p, i) => <CopayCard key={p.id} psp={p} tone={["sage", "navy", "teal"][i]} className={`au-c au-c-${i}`} />)}
      </div>
      <h2 className="au-side-h">{title}</h2>
      <ul className="au-points">
        {points.map(t => <li key={t}><Check size={16} aria-hidden="true" />{t}</li>)}
      </ul>
    </div>
  );
}
function AuthInput({ label, rightEl, ...props }) {
  const id = useId();
  return (
    <div className="fg">
      <label className="lbl" htmlFor={id}>{label}</label>
      <div className="au-field">
        <input id={id} className={`inp${rightEl ? " has-r" : ""}`} required {...props} />
        {rightEl && <div className="au-r">{rightEl}</div>}
      </div>
    </div>
  );
}
function PasswordToggle({ shown, onToggle }) {
  return (
    <button type="button" className="au-eye" onClick={onToggle} aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown}>
      {shown ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
    </button>
  );
}
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
function AuthButton({ children, loading, ...props }) {
  return <button {...props} className="btn bp au-submit" disabled={loading || props.disabled}>{children}</button>;
}
function OrDivider() {
  return <div className="au-or"><span>or</span></div>;
}
function GoogleAuthButton({ onClick, label }) {
  return <button type="button" className="btn bo au-google" onClick={onClick}><GoogleIcon />{label}</button>;
}
function AuthPage({ children }) {
  return <div className="au-wrap"><div className="au-card">{children}</div></div>;
}
function Login({ setPage, setUser }) {
  const [form, setForm] = useState({ email:"", password:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setErr("Enter your email and password."); return; }
    setLoading(true); setErr("");
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("./firebase");
      const res = await signInWithEmailAndPassword(auth, form.email, form.password);
      setUser({ name: res.user.displayName || form.email.split("@")[0], email: res.user.email });
      setPage("dashboard");
    } catch(e) {
      setErr(e.code === "auth/invalid-credential" ? "That email and password don’t match. Check both and try again." : "Couldn’t log in. Check your connection and try again.");
    }
    setLoading(false);
  };
  const googleSignIn = async () => {
    try {
      const { signInWithPopup } = await import("firebase/auth");
      const { auth, googleProvider } = await import("./firebase");
      const res = await signInWithPopup(auth, googleProvider);
      setUser({ name: res.user.displayName, email: res.user.email });
      setPage("dashboard");
    } catch(e) { setErr("Couldn’t log in with Google. Try again, or use your email and password."); }
  };
  return (
    <AuthPage>
      <AuthPanel title="Your programs, saved in one place." points={["Saved programs and their phone numbers", "Notes from your enrollment calls", "Posts in the patient community"]} />
      <div className="au-form">
        <h1 className="au-h">Log in</h1>
        <p className="au-p">Welcome back. Searching programs never needs an account.</p>
        <GoogleAuthButton onClick={googleSignIn} label="Continue with Google" />
        <OrDivider />
        <form onSubmit={submit} noValidate className="au-fields">
          <AuthInput label="Email" type="email" name="email" spellCheck={false} autoComplete="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
          <AuthInput label="Password" name="password" type={showPass ? "text" : "password"} autoComplete="current-password"
            value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))}
            rightEl={<PasswordToggle shown={showPass} onToggle={() => setShowPass(s => !s)} />} />
          {err && <p role="alert" className="au-err">{err}</p>}
          <AuthButton type="submit" loading={loading}>{loading ? "Logging in…" : "Log in"}</AuthButton>
        </form>
        <p className="au-switch">New to CureAid? <a {...linkProps(setPage, "signup")}>Create a free account</a></p>
      </div>
    </AuthPage>
  );
}
function Signup({ setPage, setUser }) {
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setErr("Enter your name, email and a password."); return; }
    if (form.password.length < 6) { setErr("Use a password with at least 6 characters."); return; }
    setLoading(true); setErr("");
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { auth } = await import("./firebase");
      const res = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(res.user, { displayName: form.name });
      setUser({ name: form.name, email: form.email });
      setPage("home");
    } catch(e) {
      setErr(e.code === "auth/email-already-in-use" ? "There’s already an account with this email. Log in instead." : "Couldn’t create your account. Check your connection and try again.");
    }
    setLoading(false);
  };
  const googleSignIn = async () => {
    try {
      const { signInWithPopup } = await import("firebase/auth");
      const { auth, googleProvider } = await import("./firebase");
      const res = await signInWithPopup(auth, googleProvider);
      setUser({ name: res.user.displayName, email: res.user.email });
      setPage("home");
    } catch(e) { setErr("Couldn’t sign up with Google. Try again, or use your email and a password."); }
  };
  return (
    <AuthPage>
      <AuthPanel title="Keep track of every program you find." points={["Save programs and come back to them", "Plan enrollment calls and record the outcome", "Ask questions in the patient community"]} />
      <div className="au-form">
        <h1 className="au-h">Create your account</h1>
        <p className="au-p">Free. No credit card, and no insurance details needed.</p>
        <GoogleAuthButton onClick={googleSignIn} label="Sign up with Google" />
        <OrDivider />
        <form onSubmit={handleSubmit} noValidate className="au-fields">
          <AuthInput label="Name" type="text" name="name" autoComplete="name" placeholder="e.g. Jordan Lee…"
            value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
          <AuthInput label="Email" type="email" name="email" spellCheck={false} autoComplete="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
          <AuthInput label="Password" name="password" type={showPass ? "text" : "password"} autoComplete="new-password" placeholder="At least 6 characters"
            value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))}
            rightEl={<PasswordToggle shown={showPass} onToggle={() => setShowPass(s => !s)} />} />
          {err && <p role="alert" className="au-err">{err}</p>}
          <AuthButton type="submit" loading={loading}>{loading ? "Creating account…" : "Create account"}</AuthButton>
        </form>
        <p className="au-switch">Already have an account? <a {...linkProps(setPage, "login")}>Log in</a></p>
      </div>
    </AuthPage>
  );
}
// Hash routes carry page state so searches, conditions and tabs can be shared and bookmarked: #search?q=Dupixent
function parseHash(validPages) {
  const [path, query = ""] = window.location.hash.replace(/^#/, "").split("?");
  const params = Object.fromEntries(new URLSearchParams(query));
  return { page: validPages.includes(path) ? path : "home", seed: Object.keys(params).length ? params : null };
}
function hrefFor(p, seed) {
  const qs = seed ? new URLSearchParams(Object.entries(seed).filter(([, v]) => v)).toString() : "";
  return `#${p}${qs ? `?${qs}` : ""}`;
}
// Real links for navigation (Cmd/Ctrl/middle-click open a new tab); a plain click navigates in place.
function linkProps(setPage, p, seed = null) {
  return {
    href: hrefFor(p, seed),
    onClick: (e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault(); setPage(p, seed); },
  };
}

export default function App() {
  const validPages = ["home","search","community","dashboard","ailab","coach","about","login","signup"];
  const [page, setPage] = useState(() => parseHash(validPages).page);
  const [user, setUser] = useState(null);
  // Optional hand-off for the destination page, e.g. a query typed on Home or the tab to open.
  const [seed, setSeed] = useState(() => parseHash(validPages).seed);
  const lastHash = useRef(window.location.hash);
  const [navCount, setNavCount] = useState(0);
  const mainRef = useRef(null);
  const firstRender = useRef(true);
  const PAGE_TITLES = { home: "CureAid: find the program that pays for your medication", search: "Search programs", community: "Patient community", dashboard: "Dashboard", ailab: "Costs & appeals", coach: "Call coach", about: "About", login: "Log in", signup: "Create account" };
  // Client-side navigation: announce the new view and move focus to it.
  useEffect(() => {
    document.title = page === "home" ? PAGE_TITLES.home : `${PAGE_TITLES[page] || "CureAid"} | CureAid`;
    if (firstRender.current) { firstRender.current = false; return; }
    mainRef.current?.focus({ preventScroll: true });
  }, [page, navCount]); // eslint-disable-line react-hooks/exhaustive-deps
  const navigate = (p, nextSeed = null) => {
    const h = hrefFor(p, nextSeed);
    lastHash.current = h;
    window.location.hash = h;
    setSeed(nextSeed);
    setNavCount(n => n + 1);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === lastHash.current) return;
      lastHash.current = window.location.hash;
      const { page: p, seed: sd } = parseHash(validPages);
      setSeed(sd); setPage(p); setNavCount(n => n + 1);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const isAuth = ["login","signup"].includes(page);
  const renderPage = () => {
    switch(page) {
      case "home":      return <Home setPage={navigate} />;
      case "search":    return <Search seed={seed} />;
      case "community": return <Community user={user} setPage={navigate} />;
      case "dashboard": return <Dashboard user={user} setPage={navigate} />;
      case "ailab":     return <AILab seed={seed} />;
      case "coach":     return <EnrollmentCoach />;
      case "about":     return <About setPage={navigate} />;
      case "login":     return <Login setPage={navigate} setUser={setUser} />;
      case "signup":    return <Signup setPage={navigate} setUser={setUser} />;
      default:          return <Home setPage={navigate} />;
    }
  };
  return (
    <>
      <style>{CSS}</style>
      <a className="skip" href="#main" onClick={e => { e.preventDefault(); document.getElementById("main")?.focus(); }}>Skip to content</a>
      <div className="app-shell">
        <Nav page={page} setPage={navigate} user={user} setUser={setUser} />
        <main id="main" tabIndex={-1} ref={mainRef} key={`${page}-${navCount}`} className="pg-anim">{renderPage()}</main>
        {!isAuth && <Footer setPage={navigate} />}
      </div>
      <MobileTabBar page={page} setPage={navigate} user={user} setUser={setUser} />
    </>
  );
}
