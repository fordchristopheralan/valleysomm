import { Calendar, Cloud, Star, DollarSign, Clock, MapPin, Utensils, Bed } from 'lucide-react';
import type { AITrailResponse, DayItinerary, WineryReviewData } from '@/lib/types';

interface Props {
  trail: AITrailResponse;
  wineryReviews?: Map<string, WineryReviewData>;
}

export default function EnhancedTrailDisplay({ trail, wineryReviews }: Props) {
  return (
    <div className="space-y-8">
      {/* Header with Weather */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">{trail.trailName}</h1>
        <p className="text-xl mb-6">{trail.summary}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <Clock className="w-6 h-6 mb-2" />
            <div className="text-sm opacity-90">Duration</div>
            <div className="font-bold">{trail.totalDuration}</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <MapPin className="w-6 h-6 mb-2" />
            <div className="text-sm opacity-90">Distance</div>
            <div className="font-bold">{trail.totalDistance}</div>
          </div>
          
          {trail.weatherForecast && (
            <div className="bg-white/10 rounded-lg p-4">
              <Cloud className="w-6 h-6 mb-2" />
              <div className="text-sm opacity-90">Weather</div>
              <div className="font-bold">{trail.weatherForecast.avgTemp}°F</div>
              <div className="text-xs opacity-75">{trail.weatherForecast.conditions}</div>
            </div>
          )}
          
          <div className="bg-white/10 rounded-lg p-4">
            <Calendar className="w-6 h-6 mb-2" />
            <div className="text-sm opacity-90">Best Time</div>
            <div className="font-bold text-sm">{trail.bestTimeToVisit}</div>
          </div>
        </div>
        
        {trail.weatherForecast?.historicalNote && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <p className="text-sm">{trail.weatherForecast.historicalNote}</p>
          </div>
        )}
      </div>

      {/* Multi-Day Itinerary */}
      {trail.isMultiDay && trail.dailyItineraries ? (
        <div className="space-y-8">
          {trail.dailyItineraries.map((day, index) => (
            <DayItineraryCard
              key={day.day}
              day={day}
              wineryReviews={wineryReviews}
            />
          ))}
        </div>
      ) : (
        /* Single Day Display */
        <div className="space-y-6">
          {trail.stops.map((stop, index) => (
            <WineryStopCard
              key={stop.wineryId}
              stop={stop}
              stopNumber={index + 1}
              reviewData={wineryReviews?.get(stop.winery.name)}
            />
          ))}
        </div>
      )}

      {/* Packing List */}
      {trail.packingList && trail.packingList.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">What to Bring</h3>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {trail.packingList.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-700">
                <span className="text-blue-600">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DayItineraryCard({ 
  day, 
  wineryReviews 
}: { 
  day: DayItinerary; 
  wineryReviews?: Map<string, WineryReviewData>;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
          {day.day}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{day.theme}</h2>
          {day.date && (
            <p className="text-gray-600">{new Date(day.date).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {day.stops.map((stop, index) => (
          <WineryStopCard
            key={stop.wineryId}
            stop={stop}
            stopNumber={index + 1}
            reviewData={wineryReviews?.get(stop.winery.name)}
          />
        ))}
      </div>

      {/* Meal & Accommodation Recommendations */}
      {(day.recommendations.lunch || day.recommendations.dinner || day.recommendations.accommodation) && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
          {day.recommendations.lunch && (
            <div className="flex items-start gap-3">
              <Utensils className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <div className="font-semibold text-gray-900">Lunch Suggestion</div>
                <div className="text-gray-700">{day.recommendations.lunch}</div>
              </div>
            </div>
          )}
          
          {day.recommendations.dinner && (
            <div className="flex items-start gap-3">
              <Utensils className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <div className="font-semibold text-gray-900">Dinner Suggestion</div>
                <div className="text-gray-700">{day.recommendations.dinner}</div>
              </div>
            </div>
          )}
          
          {day.recommendations.accommodation && (
            <div className="flex items-start gap-3">
              <Bed className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <div className="font-semibold text-gray-900">Where to Stay</div>
                <div className="text-gray-700">{day.recommendations.accommodation}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WineryStopCard({ 
  stop, 
  stopNumber, 
  reviewData 
}: { 
  stop: any; 
  stopNumber: number; 
  reviewData?: WineryReviewData;
}) {
  const priceDisplay = reviewData?.priceLevel 
    ? '$'.repeat(reviewData.priceLevel) 
    : '$$';

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              {stopNumber}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stop.winery.name}</h3>
          </div>
          
          {/* Rating & Reviews */}
          {reviewData && (
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{reviewData.rating.toFixed(1)}</span>
                <span className="text-gray-600 text-sm">
                  ({reviewData.totalReviews} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">{priceDisplay}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">Arrival</div>
          <div className="font-bold text-purple-600">{stop.arrivalTime}</div>
          <div className="text-sm text-gray-600 mt-1">{stop.duration}</div>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{stop.winery.description}</p>

      {/* Highlights from Reviews */}
      {reviewData?.highlights && reviewData.highlights.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900 mb-2">What guests love:</div>
          <div className="flex flex-wrap gap-2">
            {reviewData.highlights.map((highlight, i) => (
              <span
                key={i}
                className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Wines */}
      {stop.recommendedWines && stop.recommendedWines.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900 mb-2">Try these wines:</div>
          <div className="flex flex-wrap gap-2">
            {stop.recommendedWines.map((wine: string, i: number) => (
              <span
                key={i}
                className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full"
              >
                {wine}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Highlights */}
      {stop.highlights && stop.highlights.length > 0 && (
        <div className="mb-4">
          <ul className="space-y-1">
            {stop.highlights.map((highlight: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <span className="text-purple-600 mt-1">•</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips */}
      {stop.tips && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="text-sm font-semibold text-blue-900 mb-1">💡 Tip</div>
          <div className="text-sm text-blue-800">{stop.tips}</div>
        </div>
      )}

      {/* Winery Details */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <a
            href={stop.winery.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Visit Website →
          </a>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${stop.winery.latitude},${stop.winery.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-700 font-medium"
          >
            Get Directions →
          </a>
        </div>
      </div>
    </div>
  );
}