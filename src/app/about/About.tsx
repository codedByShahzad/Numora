"use client";

import React from "react";
import {
  Calculator,
  HeartPulse,
  DollarSign,
  Ruler,
  FlaskRound,
  Calendar,
} from "lucide-react";

const AboutContent = () => {
  const features = [
    {
      icon: <HeartPulse className="h-6 w-6 text-red-500" />,
      title: "Health Calculators",
      description:
        "From BMI and calorie calculators to heart rate and pregnancy due date calculators, we provide tools to support your health journey.",
    },
    {
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      title: "Finance Calculators",
      description:
        "Easily calculate loans, mortgages, savings growth, and budgeting with accurate and easy-to-use financial tools.",
    },
    {
      icon: <Ruler className="h-6 w-6 text-indigo-500" />,
      title: "Unit Conversions",
      description:
        "Convert between units of length, weight, volume, temperature, and more with precise and reliable conversions.",
    },
    {
      icon: <FlaskRound className="h-6 w-6 text-cyan-500" />,
      title: "Math & Science Tools",
      description:
        "Solve equations, calculate percentages, explore physics formulas, and access scientific utilities with ease.",
    },
    {
      icon: <Calendar className="h-6 w-6 text-amber-500" />,
      title: "Everyday Life Calculators",
      description:
        "From tip and discount calculators to GPA, age, and time zone tools, simplify everyday tasks in seconds.",
    },
  ];

  return (
    <div className="min-h-[92vh] px-6 py-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            About <span className="text-cyan-600">Numoro</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Numoro is your trusted hub for quick, accurate, and user-friendly
            calculators. Whether you’re managing your health, finances, studies,
            or everyday life, our mission is to make complex calculations
            simple, accurate, and always free.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-3">
            Our Mission
          </h2>
          <p className="text-gray-600 leading-relaxed">
            At Numoro, we believe that everyone should have access to tools that
            make decision-making easier. From calculating your monthly mortgage
            payments to finding your GPA or converting units for a science
            project, Numoro ensures accuracy and simplicity in every
            calculation.
          </p>
        </div>

        {/* Features / Categories */}
        <div className="my-20">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
            Explore Our Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center items-center">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md p-5 flex items-start gap-4 hover:shadow-lg transition"
              >
                <div className="flex-shrink-0 mt-[3px]">{feature.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing */}
        <div className="text-center mt-12">
          <Calculator className="mx-auto h-10 w-10 text-cyan-600 mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Simple. Accurate. Free.
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            That’s the Numoro promise. No matter what you’re calculating, our
            tools are designed to make your life easier.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutContent;
