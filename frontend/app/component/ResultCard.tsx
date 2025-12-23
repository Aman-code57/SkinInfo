"use client";

interface Props {
  result: {
    label: string;
    confidence: number;
    probs: Record<string, number>;
  };
}

type LabelType = "bkl" | "nv" | "df" | "mel" | "vasc" | "bcc" | "akiec";

const info: Record<LabelType, { name: string; risk: string; desc: string }> = {
  bkl: { name: "Benign Keratosis", risk: "Low", desc: "Harmless growth." },
  nv: { name: "Melanocytic Nevus (Mole)", risk: "Low", desc: "Benign mole." },
  df: { name: "Dermatofibroma", risk: "Low", desc: "Benign nodule." },
  mel: { name: "Melanoma", risk: "High", desc: "Dangerous skin cancer." },
  vasc: { name: "Vascular Lesion", risk: "Low", desc: "Harmless." },
  bcc: {
    name: "Basal Cell Carcinoma",
    risk: "Medium",
    desc: "Needs treatment.",
  },
  akiec: {
    name: "Actinic Keratosis / SCC",
    risk: "Medium",
    desc: "Precancerous lesion.",
  },
};

export default function ResultCard({ result }: Props) {
  const label = result.label as LabelType;
  const data = info[label];

  // FIXED: confidence value
  const confidence = (result.confidence * 100).toFixed(1);

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg max-w-xl w-full">
      <h2 className="text-2xl font-bold">{data.name}</h2>

      <p className="mt-2 text-gray-600">{data.desc}</p>

      <p className="mt-3 text-lg font-semibold">
        Confidence: <span className="text-blue-600">{confidence}%</span>
      </p>

      <h3 className="mt-6 text-lg font-bold">Probability Breakdown</h3>

      {Object.keys(result.probs).map((key) => {
        const k = key as LabelType; // FIXED TYPE
        const pct = (result.probs[key] * 100).toFixed(1);
        return (
          <div key={key} className="mt-2">
            <div className="flex justify-between text-gray-700">
              <span>{info[k].name}</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: `${pct}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
