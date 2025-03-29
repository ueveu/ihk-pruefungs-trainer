import { Question, QuestionOption, IHKExam, IHKImportedQuestion } from './types';

/**
 * Konvertiert eine IHK-Prüfungsdatei in Fragen, die von der App verwendet werden können
 * @param examData Die JSON-Daten der IHK-Prüfung
 * @returns Ein Array von Fragen im App-Format
 */
export function convertIHKExamToQuestions(examData: IHKExam): Question[] {
  const questions: Question[] = [];
  let questionId = 1000; // Starten mit einer hohen ID, um Konflikte zu vermeiden
  
  // Durchlaufe alle Aufgaben
  examData.tasks.forEach(task => {
    const taskCategory = `${examData.exam_metadata.profession} - ${task.title}`;
    
    // Durchlaufe alle Teilaufgaben
    task.subtasks.forEach(subtask => {
      // Wenn die Teilaufgabe selbst eine Frage hat
      if (subtask.question && subtask.points) {
        const options = generateOptions(subtask.answer_format);
        
        questions.push({
          id: questionId++,
          category: taskCategory,
          questionText: `${subtask.description}${subtask.scenario_context ? ` - ${subtask.scenario_context}` : ''}\n\n${subtask.question || ''}`,
          options: options,
          correctAnswer: 0, // Die erste Option ist korrekt
          explanation: subtask.calculation_needed || "Siehe IHK-Lösung für detaillierte Erklärung.",
          difficulty: calculateDifficulty(subtask.points || 0),
          originalTask: {
            taskNumber: task.task_number,
            taskTitle: task.title,
            subtaskLetter: subtask.part_letter,
            points: subtask.points || 0
          }
        } as IHKImportedQuestion);
      }
      
      // Wenn die Teilaufgabe Unteraufgaben hat
      if (subtask.sub_parts) {
        subtask.sub_parts.forEach(subPart => {
          const options = generateOptions(subPart.answer_format);
          
          questions.push({
            id: questionId++,
            category: taskCategory,
            questionText: `${subtask.description}${subtask.scenario_context ? ` - ${subtask.scenario_context}` : ''}\n\n${subPart.question}`,
            options: options,
            correctAnswer: 0, // Die erste Option ist korrekt
            explanation: subPart.calculation_needed || "Siehe IHK-Lösung für detaillierte Erklärung.",
            difficulty: calculateDifficulty(subPart.points),
            originalTask: {
              taskNumber: task.task_number,
              taskTitle: task.title,
              subtaskLetter: `${subtask.part_letter}${subPart.sub_part_letter}`,
              points: subPart.points
            }
          } as IHKImportedQuestion);
        });
      }
    });
  });
  
  return questions;
}

/**
 * Generiert Antwortoptionen basierend auf dem geforderten Antwortformat
 */
function generateOptions(answerFormat: string | undefined): QuestionOption[] {
  // Diese Funktion würde in einer vollständigen Implementierung 
  // intelligentere Antwortoptionen basierend auf dem Antwortformat generieren
  
  // Für den Prototyp erstellen wir einfache Platzhalter-Optionen
  const options: QuestionOption[] = [
    { text: "Option 1 (siehe Original-IHK-Aufgabe)", isCorrect: true },
    { text: "Option 2", isCorrect: false },
    { text: "Option 3", isCorrect: false },
    { text: "Option 4", isCorrect: false }
  ];
  
  return options;
}

/**
 * Berechnet den Schwierigkeitsgrad basierend auf den Punkten
 * 1 = leicht, 2 = mittel, 3 = schwer
 */
function calculateDifficulty(points: number): number {
  if (points <= 2) return 1;
  if (points <= 5) return 2;
  return 3;
}

/**
 * Lädt und konvertiert eine IHK-Prüfungsdatei aus einer JSON-URL
 */
export async function loadIHKExamFromURL(url: string): Promise<Question[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const examData: IHKExam = await response.json();
    return convertIHKExamToQuestions(examData);
  } catch (error) {
    console.error("Fehler beim Laden der IHK-Prüfung:", error);
    return [];
  }
}

/**
 * Lädt und konvertiert eine IHK-Prüfungsdatei aus einer lokalen Datei
 */
export function loadIHKExamFromFile(file: File): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const examData: IHKExam = JSON.parse(event.target?.result as string);
        const questions = convertIHKExamToQuestions(examData);
        resolve(questions);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Fehler beim Lesen der Datei"));
    };
    
    reader.readAsText(file);
  });
}