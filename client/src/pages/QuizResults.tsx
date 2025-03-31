
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuizResults() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Quiz results will be displayed here...</p>
        </CardContent>
      </Card>
    </div>
  );
}
