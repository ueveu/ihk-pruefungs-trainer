
import { Question } from '@/types/questions';

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

interface IHKImportedQuestion extends Question {
  originalTask: {
    taskNumber: number;
    taskTitle: string;
    subtaskLetter: string;
    points: number;
  };
}

function calculateDifficulty(points: number): number {
  if (points <= 2) return 1;
  if (points <= 4) return 2;
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
  
  // Default format for numerical or text answers
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
  let questionId = 1;

  exam.tasks.forEach(task => {
    const taskCategory = task.category || 'Allgemein';

    task.subtasks.forEach(subtask => {
      if (subtask.question && subtask.points) {
        const options = generateOptionsFromFormat(subtask.answer_format || '');
        
        questions.push({
          id: questionId++,
          category: taskCategory,
          questionText: `${subtask.description}${subtask.scenario_context ? `\n\nKontext: ${subtask.scenario_context}` : ''}\n\nFrage: ${subtask.question}`,
          options: options,
          correctAnswer: 0,
          explanation: subtask.calculation_needed || subtask.explanation || "Siehe IHK-Lösung für detaillierte Erklärung.",
          difficulty: calculateDifficulty(subtask.points),
          points: subtask.points,
          originalTask: {
            taskNumber: task.task_number,
            taskTitle: task.title,
            subtaskLetter: subtask.part_letter,
            points: subtask.points
          }
        });
      }
      
      if (subtask.sub_parts) {
        subtask.sub_parts.forEach(subPart => {
          if (subPart.question && subPart.points) {
            const options = generateOptionsFromFormat(subPart.answer_format);
            
            questions.push({
              id: questionId++,
              category: taskCategory,
              questionText: `${subtask.description} - ${subPart.question}${subPart.scenario_context ? `\n\nKontext: ${subPart.scenario_context}` : ''}`,
              options: options,
              correctAnswer: 0,
              explanation: subPart.calculation_needed || subPart.explanation || "Siehe IHK-Lösung für detaillierte Erklärung.",
              difficulty: calculateDifficulty(subPart.points),
              points: subPart.points,
              originalTask: {
                taskNumber: task.task_number,
                taskTitle: task.title,
                subtaskLetter: subtask.part_letter,
                points: subPart.points
              }
            });
          }
        });
      }
    });
  });

  return questions;
}

export function importExamFile(file: File): Promise<IHKImportedQuestion[]> {
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
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}
