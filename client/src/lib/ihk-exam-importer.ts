
import { Question, IHKExam, IHKImportedQuestion } from '@/lib/types';

interface IHKSubPart {
  question: string;
  points: number;
  answer_format: string;
  calculation_needed?: string;
  explanation?: string;
  scenario_context?: string;
}

interface IHKSubtask {
  part_letter: string;
  description: string;
  question?: string;
  points?: number;
  answer_format?: string;
  calculation_needed?: string;
  explanation?: string;
  scenario_context?: string;
  sub_parts?: IHKSubPart[];
}

interface IHKTask {
  task_number: number;
  title: string;
  category: string;
  subtasks: IHKSubtask[];
}

interface IHKExam {
  title: string;
  tasks: IHKTask[];
}

function calculateDifficulty(points: number): number {
  if (points <= 5) return 1;
  if (points <= 10) return 2;
  return 3;
}

function generateOptionsFromFormat(format: string): { text: string }[] {
  if (format.includes("Ja/Nein")) {
    return [
      { text: "Ja" },
      { text: "Nein" }
    ];
  }

  if (format.includes("Liste")) {
    return [
      { text: "Option 1" },
      { text: "Option 2" },
      { text: "Option 3" },
      { text: "Option 4" }
    ];
  }

  return [
    { text: "Antwortmöglichkeit 1" },
    { text: "Antwortmöglichkeit 2" },
    { text: "Antwortmöglichkeit 3" },
    { text: "Antwortmöglichkeit 4" }
  ];
}

export function convertIHKExamToQuestions(examJson: string): IHKImportedQuestion[] {
  const exam: IHKExam = JSON.parse(examJson);
  const questions: IHKImportedQuestion[] = [];

  exam.tasks.forEach(task => {
    task.subtasks.forEach(subtask => {
      if (subtask.question) {
        questions.push({
          id: 0,
          category: task.category || 'Allgemein',
          questionText: subtask.question,
          options: generateOptionsFromFormat(subtask.answer_format || ''),
          correctAnswer: 0,
          explanation: subtask.explanation,
          difficulty: calculateDifficulty(subtask.points || 0),
          originalTask: {
            taskNumber: task.task_number,
            taskTitle: task.title,
            subtaskLetter: subtask.part_letter,
            points: subtask.points || 0
          }
        } as IHKImportedQuestion);
      }

      if (subtask.sub_parts) {
        subtask.sub_parts.forEach(subPart => {
          questions.push({
            id: 0,
            category: task.category || 'Allgemein',
            questionText: subPart.question,
            options: generateOptionsFromFormat(subPart.answer_format),
            correctAnswer: 0,
            explanation: subPart.calculation_needed,
            difficulty: calculateDifficulty(subPart.points),
            originalTask: {
              taskNumber: task.task_number,
              taskTitle: task.title,
              subtaskLetter: subtask.part_letter,
              points: subPart.points
            }
          } as IHKImportedQuestion);
        });
      }
    });
  });

  return questions;
}

export async function loadIHKExamFromFile(file: File): Promise<IHKImportedQuestion[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const questions = convertIHKExamToQuestions(e.target?.result as string);
        resolve(questions);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function loadIHKExamFromURL(url: string): Promise<IHKImportedQuestion[]> {
  const response = await fetch(url);
  const examJson = await response.text();
  return convertIHKExamToQuestions(examJson);
}
