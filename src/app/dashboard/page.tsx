// app/dashboard/page.tsx
import { db } from '@/lib/db'; // your Postgres client
import { format, subDays } from 'date-fns';

async function getDailyMetrics() {
  const today = new Date();
  const yesterday = subDays(today, 1);

  const [todayData, yesterdayData] = await Promise.all([
    db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE event_type = 'trail_generated') as trails_generated,
        COUNT(*) FILTER (WHERE event_type = 'quiz_started') as quiz_starts,
        COUNT(*) FILTER (WHERE event_type = 'quiz_completed') as quiz_completions,
        COUNT(*) FILTER (WHERE event_type = 'trail_shared') as trails_shared,
        COUNT(DISTINCT properties->>'ip_address') as unique_visitors
      FROM analytics_events
      WHERE timestamp >= $1 AND timestamp < $2
    `, [today.toISOString().split('T')[0], today.toISOString()]),

    db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE event_type = 'trail_generated') as trails_generated,
        COUNT(*) FILTER (WHERE event_type = 'quiz_started') as quiz_starts,
        COUNT(*) FILTER (WHERE event_type = 'quiz_completed') as quiz_completions,
        COUNT(*) FILTER (WHERE event_type = 'trail_shared') as trails_shared
      FROM analytics_events
      WHERE timestamp >= $1 AND timestamp < $2
    `, [yesterday.toISOString().split('T')[0], today.toISOString().split('T')[0]]),
  ]);

  const t = todayData[0] || {};
  const y = yesterdayData[0] || {};

  const percentChange = (current: number, prev: number) => 
    prev === 0 ? null : ((current - prev) / prev * 100);

  return {
    trailsGenerated: { today: Number(t.trails_generated || 0), change: percentChange(Number(t.trails_generated || 0), Number(y.trails_generated || 0)) },
    completionRate: { today: t.quiz_starts > 0 ? (Number(t.quiz_completions || 0) / Number(t.quiz_starts)) * 100 : 0 },
    shareRate: { today: t.trails_generated > 0 ? (Number(t.trails_shared || 0) / Number(t.trails_generated || 0)) * 100 : 0 },
    uniqueVisitors: Number(t.unique_visitors || 0),
  };
}

export default async function Dashboard() {
  const metrics = await getDailyMetrics();

  const Arrow = ({ up }: { up: boolean }) => 
    up ? <span className="text-green-600">↑</span> : <span className="text-red-600">↓</span>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Valley Somm Daily Health</h1>
        <p className="text-gray-600 mb-8">Last 24 hours vs previous 24h • {format(new Date(), 'MMM d, yyyy')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Trails Generated</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{metrics.trailsGenerated.today}</p>
            {metrics.trailsGenerated.change !== null && (
              <p className="text-sm mt-2">
                {metrics.trailsGenerated.change > 0 ? <Arrow up /> : <Arrow up={false} />}
                {Math.abs(metrics.trailsGenerated.change).toFixed(0)}%
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Completion Rate</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{metrics.completionRate.today.toFixed(0)}%</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Share Rate</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{metrics.shareRate.today.toFixed(0)}%</p>
            {metrics.shareRate.today < 70 && (
              <p className="text-sm text-red-600 mt-2">⚠️ Below target (70%)</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Unique Visitors</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{metrics.uniqueVisitors}</p>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <p className="font-semibold text-yellow-800">Alerts</p>
          <ul className="mt-2 space-y-1 text-yellow-700">
            {metrics.shareRate.today < 70 && <li>• Share rate below target — trails may not be exciting enough</li>}
            {metrics.completionRate.today < 85 && <li>• Completion rate low — check UX friction</li>}
            {metrics.trailsGenerated.today === 0 && <li>• No trails generated today — investigate traffic or errors</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}