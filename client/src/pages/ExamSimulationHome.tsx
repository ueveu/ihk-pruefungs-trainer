import React from 'react';
import { useLocation } from 'wouter';
import ExamPicker from '@/components/exam/ExamPicker';
import { ClipboardCheck, Clock, BrainCircuit } from 'lucide-react';

const ExamSimulationHome: React.FC = () => {
  const [, setLocation] = useLocation();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          IHK-Prüfungssimulation
        </h1>
        <p className="text-lg text-neutral-600">
          Bereite dich auf die IHK-Abschlussprüfung unter realistischen Bedingungen vor
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200">
          <div className="flex items-center mb-3">
            <div className="rounded-full bg-primary/10 p-2 mr-3">
              <ClipboardCheck className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Originalgetreue Fragen</h3>
          </div>
          <p className="text-sm text-neutral-600">
            Trainiere mit Prüfungsfragen im Format der echten IHK-Abschlussprüfung.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200">
          <div className="flex items-center mb-3">
            <div className="rounded-full bg-primary/10 p-2 mr-3">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Realistisches Zeitlimit</h3>
          </div>
          <p className="text-sm text-neutral-600">
            Übung unter Zeitdruck mit dem gleichen Zeitlimit wie in der echten Prüfung.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-neutral-200">
          <div className="flex items-center mb-3">
            <div className="rounded-full bg-primary/10 p-2 mr-3">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">KI-Bewertung</h3>
          </div>
          <p className="text-sm text-neutral-600">
            Erhalte präzises Feedback und Bewertungen deiner Antworten von unserer KI.
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">
          Verfügbare IHK-Prüfungen
        </h2>
        
        <ExamPicker />
      </div>
    </div>
  );
};

export default ExamSimulationHome;