import React from 'react';
import { Cpu, Database, ShieldCheck, Target, ArrowRight } from 'lucide-react';

export const AboutPlacera: React.FC = () => (
  <div className="pb-16 space-y-8">
    <section className="rounded-3xl bg-white border border-slate-200 shadow-sm px-6 py-10 sm:px-10 sm:py-14">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700">ABOUT THE PLATFORM</span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">About <span className="text-indigo-600">PLACERA</span></h1>
        <p className="text-lg text-slate-600 leading-relaxed">PLACERA is an AI-assisted campus placement and career recommendation portal designed to help students understand how their academic profile, skills, projects and achievements align with job opportunities.</p>
      </div>
    </section>
    <section className="max-w-5xl mx-auto space-y-5">
      <h2 className="text-2xl font-black text-slate-900 text-center">How the Platform Works</h2>
      <p className="text-sm sm:text-base text-slate-600 text-center max-w-3xl mx-auto">The platform brings profile information and opportunity requirements together to provide explainable placement matches and practical next steps.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { icon: Target, title: '1. Build a student profile', text: 'Add academic details, skills, projects, certifications and career preferences to create a structured profile.' },
          { icon: Cpu, title: '2. Analyse compatibility', text: 'The recommendation workflow compares profile attributes with opportunity requirements and presents relevant match insights.' },
          { icon: ArrowRight, title: '3. Explore matches and skill gaps', text: 'Review recommended roles, understand areas of alignment, and identify skills that may improve future eligibility.' },
          { icon: ShieldCheck, title: '4. Support verified access', text: 'Student verification and separate placement-officer access help organise the campus placement workflow.' }
        ].map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600"><Icon className="h-5 w-5" /></div><h3 className="font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p></article>)}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex gap-3 items-start"><Database className="h-5 w-5 mt-0.5 text-indigo-600 shrink-0" /><p className="text-sm text-slate-600 leading-relaxed">Recommendations should be treated as decision-support guidance, not a guarantee of selection. Availability and accuracy depend on the data and implementation connected to the current version.</p></div>
    </section>
  </div>
);
