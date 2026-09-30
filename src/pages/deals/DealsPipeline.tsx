import React, { useState } from 'react';
import {
  Plus,
  Briefcase,
  TrendingUp,
  DollarSign,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import type { Deal, DealStage } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';

interface DealsPipelineProps {
  deals: Deal[];
  onOpenCreate: () => void;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (id: string) => Promise<void>;
  onUpdateStage: (dealId: string, stage: DealStage) => Promise<void>;
}

const PIPELINE_STAGES: DealStage[] = [
  'New',
  'Qualified',
  'Site Visit',
  'Negotiation',
  'Documentation',
  'Closed Won',
  'Closed Lost',
];

export const DealsPipeline: React.FC<DealsPipelineProps> = ({
  deals,
  onOpenCreate,
  onEditDeal,
  onDeleteDeal,
  onUpdateStage,
}) => {
  const { showToast } = useToast();
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Stats
  const activePipelineValue = deals
    .filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
    .reduce((sum, d) => sum + (d.dealValue || 0), 0);

  const wonRevenue = deals
    .filter((d) => d.stage === 'Closed Won')
    .reduce((sum, d) => sum + (d.dealValue || 0), 0);

  const handleDelete = async () => {
    if (!dealToDelete) return;
    setDeleting(true);
    try {
      await onDeleteDeal(dealToDelete.id);
      showToast('Deal removed from pipeline.');
      setDealToDelete(null);
    } catch (err: any) {
      showToast('Failed to delete deal: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const getStageColor = (stage: DealStage) => {
    switch (stage) {
      case 'Closed Won':
        return 'border-t-emerald-500 bg-emerald-50/20';
      case 'Closed Lost':
        return 'border-t-slate-400 bg-slate-50/30';
      case 'Negotiation':
        return 'border-t-amber-500 bg-amber-50/20';
      case 'Documentation':
        return 'border-t-indigo-600 bg-indigo-50/20';
      default:
        return 'border-t-blue-500 bg-blue-50/10';
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sales &amp; Deals Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage progression and expected transaction revenue
          </p>
        </div>

        <Button size="sm" onClick={onOpenCreate} icon={<Plus className="w-3.5 h-3.5" />}>
          New Deal
        </Button>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card bodyClassName="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Pipeline Value
            </span>
            <span className="text-lg font-bold text-slate-900 tracking-tight font-mono tabular-nums">
              {formatINR(activePipelineValue)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>

        <Card bodyClassName="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Won Closed Revenue
            </span>
            <span className="text-lg font-bold text-emerald-700 tracking-tight font-mono tabular-nums">
              {formatINR(wonRevenue)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>

        <Card bodyClassName="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Deals Tracked
            </span>
            <span className="text-lg font-bold text-indigo-700 tracking-tight font-mono tabular-nums">
              {deals.length} deals
            </span>
          </div>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Briefcase className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Visual Pipeline Board (Horizontal Scrollable Columns) */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px]">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            const stageTotalValue = stageDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0);

            return (
              <div
                key={stage}
                className="w-72 shrink-0 flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200/80 p-3 max-h-[75vh]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 tracking-tight">{stage}</h3>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {formatINR(stageTotalValue)}
                    </span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-[10px] font-bold flex items-center justify-center shadow-2xs border border-slate-200">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Deal Cards in this column */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {stageDeals.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400">
                      No deals in {stage}
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className={`bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 border-t-4 transition hover:shadow-md ${getStageColor(
                          deal.stage
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {deal.dealName}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => onEditDeal(deal)}
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDealToDelete(deal)}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-sm font-black text-slate-900">
                            {formatINR(deal.dealValue)}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {deal.probability}% Prob
                          </span>
                        </div>

                        {(deal.leadName || deal.clientName) && (
                          <p className="text-[11px] text-slate-600 mt-1 truncate">
                            Client: {deal.leadName || deal.clientName}
                          </p>
                        )}

                        {deal.propertyTitle && (
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Unit: {deal.propertyTitle}
                          </p>
                        )}

                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Close: {formatDate(deal.expectedClosingDate)}</span>
                        </div>

                        {/* Move stage dropdown */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-400">Move:</span>
                          <select
                            value={deal.stage}
                            onChange={(e) => onUpdateStage(deal.id, e.target.value as DealStage)}
                            className="text-[11px] font-semibold rounded-md border border-slate-200 bg-white px-2 py-0.5 text-slate-700 cursor-pointer focus:outline-none"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(dealToDelete)}
        onClose={() => setDealToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Deal"
        message={`Are you sure you want to remove deal "${dealToDelete?.dealName}" from pipeline?`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
};
