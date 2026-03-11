import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { useOsackaStore } from '../../store/osackaStore';
import { contacts } from '../../data/osacka/contacts';

const EpiCurve: React.FC = () => {
  const epiCurveData = useOsackaStore((s) => s.epiCurveData);
  const selectedContact = useOsackaStore((s) => s.selectedContact);
  const addToEpiCurve = useOsackaStore((s) => s.addToEpiCurve);
  const removeFromEpiCurve = useOsackaStore((s) => s.removeFromEpiCurve);

  const chartData = epiCurveData.map((entry) => ({
    name: `${entry.day}.11.`,
    day: entry.day,
    count: entry.contactIds.length,
    contactIds: entry.contactIds,
  }));

  const handleBarClick = (data: { day: number }) => {
    if (selectedContact) {
      addToEpiCurve(data.day, selectedContact);
    }
  };

  const getContactName = (id: string) => {
    const c = contacts.find((ct) => ct.id === id);
    return c?.name ?? id;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-bold text-gray-800 mb-3">
        Epidemicka krivka (Listopad)
      </h3>

      <div className="overflow-x-auto">
        <BarChart
          width={700}
          height={200}
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-white border border-gray-300 rounded p-2 shadow-lg text-xs">
                  <p className="font-bold">{data.name}</p>
                  <p>Pocet: {data.count}</p>
                  {data.contactIds.map((id: string) => (
                    <p key={id} className="text-gray-600">
                      {getContactName(id)}
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Bar
            dataKey="count"
            cursor={selectedContact ? 'pointer' : 'default'}
            onClick={(_, idx) => handleBarClick(chartData[idx])}
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.day}`}
                fill={entry.count > 0 ? '#ef4444' : '#e5e7eb'}
              />
            ))}
          </Bar>
        </BarChart>
      </div>

      {/* Contact assignments per day */}
      <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
        {epiCurveData
          .filter((e) => e.contactIds.length > 0)
          .map((entry) => (
            <div
              key={entry.day}
              className="flex items-start gap-2 text-xs text-gray-600"
            >
              <span className="font-medium text-gray-800 shrink-0 w-12">
                {entry.day}.11.
              </span>
              <div className="flex flex-wrap gap-1">
                {entry.contactIds.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full"
                  >
                    {getContactName(id)}
                    <button
                      onClick={() => removeFromEpiCurve(entry.day, id)}
                      className="text-red-400 hover:text-red-600 font-bold"
                      title="Odebrat"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>

      {selectedContact && (
        <p className="mt-2 text-xs text-blue-600">
          Kliknete na sloupcek pro prirazeni vybraneho kontaktu k danemu dni.
        </p>
      )}
    </div>
  );
};

export default EpiCurve;
