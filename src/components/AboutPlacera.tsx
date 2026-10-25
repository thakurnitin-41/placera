import React from 'react';
import { ActivePage } from '../types';
import { ArrowRight, BookOpen, CheckCircle2, Database, GraduationCap, Layers, Target, UserPlus, Cpu, ShieldCheck } from 'lucide-react';

interface AboutPlaceraProps { setActivePage: (page: ActivePage) => void; onGetStarted: () => void; }

export const AboutPlacera: React.FC<AboutPlaceraProps> = ({ setActivePage, onGetStarted }) => (
  <div className="pb-16 space-y-10">
    <section className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 px-6 py-12 sm:px-10 sm:py-16 text-white">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100"><BookOpen className="w-4 h-4" /> About PLACERA</div>
          <h1 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight">A clearer path from skills to opportunities.</h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base leading-7 text-indigo-100">PLACERA is an AI-assisted campus placement and career recommendation platform. It brings academic information, skills, projects, and achievements together to help students understand how their profiles align with available opportunities.</p>
          <button onClick={onGetStarted} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-950 hover:bg-indigo-50">Get Started (Register / Sign In) <ArrowRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-8">
        {[{icon:GraduationCap,title:'Student profile',text:'Bring academics, technical skills, projects, and achievements into one profile.'},{icon:Target,title:'Explainable matching',text:'Compare profile information with opportunity criteria and review match factors.'},{icon:Layers,title:'Career preparation',text:'Use recommendations and skill-gap insights to plan the next steps.'}].map(item => <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700"><item.icon className="w-5 h-5" /></div><h2 className="font-bold text-slate-900">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p></article>)}
      </div>
    </section>
    <section className="space-y-5">
      <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">How Platform Works</p><h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">From profile details to practical next steps</h2><p className="mt-3 text-sm leading-6 text-slate-600">The platform is designed to make its placement workflow understandable rather than treating a match score as a black box.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{n:'01',title:'Create your profile',text:'Register and provide relevant academic details and placement preferences.',icon:UserPlus},{n:'02',title:'Add skills & evidence',text:'Record programming skills, projects, achievements, and verified milestones.',icon:Database},{n:'03',title:'Evaluate alignment',text:'The matching workflow compares profile information with opportunity criteria and highlights fit factors.',icon:Cpu},{n:'04',title:'Review & prepare',text:'Explore ranked opportunities, missing skills, and suggested preparation steps.',icon:Target}].map(step => <article key={step.n} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-black text-indigo-600">{step.n}</span><step.icon className="w-5 h-5 text-slate-400" /></div><h3 className="mt-4 font-bold text-slate-900">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p></article>)}
      </div>
    </section>
    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 sm:flex-row sm:items-center sm:p-6"><div><h2 className="font-bold text-slate-900">Ready to explore your placement profile?</h2><p className="mt-1 text-sm text-slate-600">Start from the same entry point for the student and admin portals.</p></div><button onClick={onGetStarted} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">Get Started <ArrowRight className="w-4 h-4" /></button></div>
  </div>
);
