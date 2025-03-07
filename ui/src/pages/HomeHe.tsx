import React from "react";
import { ContentContainer } from "../components/ContentContainer";
import { Button } from "../components/Button";

const HomeHe = () => {
  return (
    <ContentContainer>
      <div className="max-w-3xl mx-auto text-center" dir="rtl">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          ערכת התחלה מודרנית ל-React
        </h1>
        
        <p className="text-lg mb-8 text-gray-700">
          ברוכים הבאים לפרויקט React החדש שלכם! ערכת ההתחלה הזו כוללת את כל מה שאתם צריכים
          כדי לבנות אפליקציות ווב מודרניות עם React, TypeScript ו-Tailwind CSS.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">🚀 התחלה מהירה</h2>
            <p className="text-gray-600">
              ערכו את <code className="bg-gray-100 px-2 py-1 rounded">src/pages/HomeHe.tsx</code> כדי
              להתאים את העמוד הזה ולהתחיל לבנות את האפליקציה שלכם.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">📚 משאבים</h2>
            <ul className="text-gray-600 text-right list-disc list-inside">
              <li>תיעוד Vite</li>
              <li>תיעוד React</li>
              <li>מדריך Tailwind CSS</li>
              <li>מדריך TypeScript</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center items-center space-x-reverse space-x-4">
          <Button variant="primary">
            בואו נתחיל
          </Button>
          <Button variant="secondary">
            צפה בתיעוד
          </Button>
          <div className="h-8 w-px bg-gray-300 mx-2"></div>
          <Button variant="accent" to="/">
            English
          </Button>
        </div>
      </div>
    </ContentContainer>
  );
};

export { HomeHe };
