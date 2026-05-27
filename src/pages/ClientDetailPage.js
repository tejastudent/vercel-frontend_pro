import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clientsAPI, recommendationsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const RISK_QUESTIONS = [
  {
    question: 'What is your age group?',
    key: 'age',
    options: [
      { label: 'Under 35', value: 'age_under35' },
      { label: '35–50', value: 'age_35to50' },
      { label: '51–60', value: 'age_51to60' },
      { label: 'Over 60', value: 'age_over60' }
    ]
  },
  {
    question: 'What is your annual income level?',
    key: 'income',
    options: [
      { label: 'High (>₹30L)', value: 'income_high' },
      { label: 'Medium (₹10–30L)', value: 'income_medium' },
      { label: 'Low (<₹10L)', value: 'income_low' }
    ]
  },
  {
    question: 'What is your investment experience?',
    key: 'experience',
    options: [
      { label: 'Expert (10+ years)', value: 'experience_expert' },
      { label: 'Moderate (3–10 years)', value: 'experience_moderate' },
      { label: 'Beginner (1–3 years)', value: 'experience_beginner' },
      { label: 'None', value: 'experience_none' }
    ]
  },
  {
    question: 'If your portfolio drops 20%, what would you do?',
    key: 'loss_reaction',
    options: [
      { label: 'Buy more — great opportunity', value: 'loss_buy_more' },
      { label: 'Hold and wait', value: 'loss_hold' },
      { label: 'Sell a portion to limit losses', value: 'loss_sell_some' },
      { label: 'Sell everything', value: 'loss_sell_all' }
    ]
  },
  {
    question: 'What is your investment time horizon?',
    key: 'duration',
    options: [
      { label: 'Over 10 years', value: 'duration_over10' },
      { label: '5–10 years', value: 'duration_5to10' },
      { label: '2–5 years', value: 'duration_2to5' },
      { label: 'Less than 2 years', value: 'duration_under2' }
    ]
  }
];

const GOAL_LABELS = {
  wealth_building: 'Wealth Building', retirement: 'Retirement',
  education: 'Education', tax_saving: 'Tax Saving',
  emergency_fund: 'Emergency Fund', home_purchase: 'Home Purchase', other: 'Other'
};

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showRisk, setShowRisk] = useState(false);
  const [riskAnswers, setRiskAnswers] = useState({});
  const [submittingRisk, setSubmittingRisk] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    clientsAPI.getOne(id)
      .then(r => { setClient(r.data); setEditForm(r.data); })
      .catch(() => toast.error('Client not found'))
      .finally(() => setLoading(false));

    // Fetch AI recommendations
    setLoadingRecs(true);
    recommendationsAPI.getForClient(id)
      .then(r => setRecommendations(r.data.recommendations))
      .catch(() => console.error('Failed to load recommendations'))
      .finally(() => setLoadingRecs(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await clientsAPI.update(id, editForm);
      setClient(data);
      setEditing(false);
      toast.success('Client updated');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleRiskSubmit = async () => {
    if (Object.keys(riskAnswers).length < RISK_QUESTIONS.length) {
      return toast.error('Please answer all questions');
    }
    setSubmittingRisk(true);
    try {
      const answers = RISK_QUESTIONS.map(q => ({
        question: q.question,
        answer: q.options.find(o => o.value === riskAnswers[q.key])?.label || '',
        value: riskAnswers[q.key]
      }));
      const { data } = await clientsAPI.submitRiskQuestionnaire(id, { answers });
      setClient(data.client);
      setShowRisk(false);
      toast.success(`Risk profile updated: ${data.riskTolerance} (${data.score}/100)`);
    } catch (e) {
      toast.error('Risk assessment failed');
    } finally {
      setSubmittingRisk(false);
    }
  };

  if (loading) return <div className="p-6 text-slate-500 text-center pt-20">Loading client...</div>;
  if (!client) return <div className="p-6 text-red-400 text-center pt-20">Client not found</div>;

  const riskColor = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-blue-400' };
  const riskBg = { high: 'bg-red-500/20 border-red-500/30', medium: 'bg-yellow-500/20 border-yellow-500/30', low: 'bg-blue-500/20 border-blue-500/30' };
  const inputClass = "w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50";

  return (
    <div className="p-6 font-body animate-fade-in space-y-6 max-w-4xl">
      {/* Risk questionnaire modal */}
      {showRisk && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-lg p-6 animate-slide-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-display font-bold text-white">Risk Questionnaire</h2>
              <button onClick={() => setShowRisk(false)} className="text-slate-500 hover:text-slate-300 text-lg">×</button>
            </div>
            <div className="space-y-5">
              {RISK_QUESTIONS.map((q, qi) => (
                <div key={q.key}>
                  <p className="text-sm text-slate-300 mb-3">
                    <span className="text-primary-400 font-bold mr-2">{qi + 1}.</span>{q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map(opt => (
                      <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        riskAnswers[q.key] === opt.value
                          ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                          : 'border-surface-500 text-slate-400 hover:border-surface-400 hover:text-slate-300'
                      }`}>
                        <input
                          type="radio" name={q.key} value={opt.value} className="sr-only"
                          checked={riskAnswers[q.key] === opt.value}
                          onChange={() => setRiskAnswers(p => ({ ...p, [q.key]: opt.value }))}
                        />
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                          riskAnswers[q.key] === opt.value ? 'border-primary-400 bg-primary-400' : 'border-slate-500'
                        }`} />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRisk(false)} className="flex-1 border border-surface-500 text-slate-400 rounded-lg py-2.5 text-sm transition-colors hover:border-slate-400">
                Cancel
              </button>
              <button onClick={handleRiskSubmit} disabled={submittingRisk} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-colors">
                {submittingRisk ? 'Submitting...' : 'Calculate Risk Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb + header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link to="/clients" className="text-slate-500 hover:text-slate-300 text-sm">Clients</Link>
          <span className="text-slate-600">›</span>
          <span className="text-slate-300 text-sm">{client.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-600/20 text-primary-400 font-bold flex items-center justify-center text-lg">
              {client.initials}
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white">{client.name}</h1>
              <p className="text-sm text-slate-500">{client.email} · Age {client.age}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRisk(true)}
              className="text-sm border border-surface-500 hover:border-primary-500/50 text-slate-400 hover:text-primary-400 px-3 py-2 rounded-lg transition-colors"
            >
              ◎ Risk Profile
            </button>
            <Link
              to={`/clients/${id}/portfolio`}
              className="text-sm border border-surface-500 hover:border-slate-400 text-slate-400 hover:text-slate-200 px-3 py-2 rounded-lg transition-colors"
            >
              Portfolio →
            </Link>
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="text-sm border border-surface-500 text-slate-400 px-3 py-2 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="text-sm bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="text-sm bg-surface-600 hover:bg-surface-500 text-slate-200 px-4 py-2 rounded-lg transition-colors">
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Risk badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${riskBg[client.riskTolerance]}`}>
        <span className={`text-sm font-bold ${riskColor[client.riskTolerance]}`}>
          {client.riskTolerance?.toUpperCase()} RISK
        </span>
        {client.riskScore != null && (
          <span className="text-xs text-slate-400">Score: {client.riskScore}/100</span>
        )}
        {!client.riskScore && (
          <button onClick={() => setShowRisk(true)} className="text-xs text-primary-400 hover:text-primary-300">
            · Take assessment →
          </button>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Personal info */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="font-display font-bold text-white text-sm mb-4">Personal Information</h2>
          <div className="space-y-3">
            {[
              { label: 'Full Name', key: 'name', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone', type: 'tel' },
              { label: 'Age', key: 'age', type: 'number' }
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
                {editing ? (
                  <input
                    type={field.type}
                    className={inputClass}
                    value={editForm[field.key] || ''}
                    onChange={e => setEditForm(p => ({ ...p, [field.key]: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm text-slate-300">{client[field.key] || '—'}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Investment info */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="font-display font-bold text-white text-sm mb-4">Investment Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Annual Income</label>
              {editing ? (
                <input type="number" className={inputClass} value={editForm.income || ''} onChange={e => setEditForm(p => ({ ...p, income: e.target.value }))} />
              ) : (
                <p className="text-sm text-slate-300">₹{client.income?.toLocaleString('en-IN')}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Investment Goal</label>
              {editing ? (
                <select className={inputClass} value={editForm.investmentGoal || ''} onChange={e => setEditForm(p => ({ ...p, investmentGoal: e.target.value }))}>
                  {Object.entries(GOAL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ) : (
                <p className="text-sm text-slate-300">{GOAL_LABELS[client.investmentGoal] || '—'}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Investment Duration</label>
              {editing ? (
                <input type="number" className={inputClass} value={editForm.investmentDuration || ''} onChange={e => setEditForm(p => ({ ...p, investmentDuration: e.target.value }))} />
              ) : (
                <p className="text-sm text-slate-300">{client.investmentDuration} years</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Risk Tolerance</label>
              {editing ? (
                <select className={inputClass} value={editForm.riskTolerance || ''} onChange={e => setEditForm(p => ({ ...p, riskTolerance: e.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <p className={`text-sm font-medium capitalize ${riskColor[client.riskTolerance]}`}>{client.riskTolerance}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="lg:col-span-2 bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="font-display font-bold text-white text-sm mb-3">Notes</h2>
          {editing ? (
            <textarea
              rows={3}
              className={inputClass}
              value={editForm.notes || ''}
              onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Add notes about this client..."
            />
          ) : (
            <p className="text-sm text-slate-400">{client.notes || 'No notes added.'}</p>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="lg:col-span-2 bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white text-sm">✦ Next-Best-Action (AI Insights)</h2>
            {loadingRecs && <span className="text-xs text-primary-400 animate-pulse">Generating...</span>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!loadingRecs && recommendations && recommendations.map((rec, i) => (
              <div key={i} className={`p-4 rounded-xl border ${rec.isSafe === false ? 'bg-red-500/10 border-red-500/30' : 'bg-surface-700 border-surface-600'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    rec.actionType === 'Upsell' ? 'bg-green-500/20 text-green-400' :
                    rec.actionType === 'Rebalance' ? 'bg-blue-500/20 text-blue-400' :
                    rec.actionType === 'RiskAlert' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {rec.actionType}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{rec.title}</h3>
                <p className="text-xs text-slate-400 mb-2">{rec.description}</p>
                {rec.isSafe === false && (
                  <p className="text-[10px] text-red-400 mt-2">⚠️ Compliance Warning: {rec.warning}</p>
                )}
              </div>
            ))}
            {!loadingRecs && (!recommendations || recommendations.length === 0) && (
              <p className="text-sm text-slate-500 col-span-3 text-center py-4">No recommendations available at this time.</p>
            )}
          </div>
        </div>

        {/* Risk questionnaire results */}
        {client.riskQuestionnaire?.answers?.length > 0 && (
          <div className="lg:col-span-2 bg-surface-800 border border-surface-600 rounded-xl p-5">
            <h2 className="font-display font-bold text-white text-sm mb-4">Risk Assessment Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {client.riskQuestionnaire.answers.map((a, i) => (
                <div key={i} className="bg-surface-700 rounded-lg p-3 border border-surface-600">
                  <p className="text-xs text-slate-500 mb-1">{a.question}</p>
                  <p className="text-sm text-slate-200">{a.answer}</p>
                  <p className="text-xs text-primary-400 mt-1">Score: {a.score}/20</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Assessed on {new Date(client.riskQuestionnaire.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetailPage;
