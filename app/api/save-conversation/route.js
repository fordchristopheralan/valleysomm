// ============================================================================
// API ROUTE: /api/save-conversation
// ============================================================================
// Purpose: Save conversation data to Supabase for analysis and improvement
// Called: After each message or at end of conversation
// ============================================================================

import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const data = await request.json()
    
    const {
      session_id,
      action, // 'start', 'message', 'complete', 'itinerary'
      message_data,
      conversation_data,
      itinerary_data,
      metadata
    } = data

    // ========================================================================
    // ACTION: Start new session
    // ========================================================================
    if (action === 'start') {
      const { error } = await supabase
        .from('conversation_sessions')
        .insert({
          session_id,
          user_agent: metadata?.user_agent,
          referrer: metadata?.referrer,
          utm_source: metadata?.utm_source,
          utm_medium: metadata?.utm_medium,
          utm_campaign: metadata?.utm_campaign,
        })

      if (error) throw error

      return Response.json({ success: true })
    }

    // ========================================================================
    // ACTION: Save individual message
    // ========================================================================
    if (action === 'message') {
      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          session_id,
          message_index: message_data.index,
          role: message_data.role,
          content: message_data.content,
          suggestion_clicked: message_data.suggestion_clicked,
        })

      if (error) throw error

      // Update session message count
      await supabase.rpc('increment_message_count', { 
        p_session_id: session_id 
      })

      return Response.json({ success: true })
    }

    // ========================================================================
    // ACTION: Update conversation data (after each step)
    // ========================================================================
    if (action === 'update_data') {
      // Upsert conversation_data
      const { error } = await supabase
        .from('conversation_data')
        .upsert({
          session_id,
          current_step: conversation_data.currentStep,
          steps_completed: conversation_data.stepsCompleted,
          when_raw: conversation_data.when,
          when_normalized: conversation_data.whenNormalized,
          group_size_raw: conversation_data.groupSize,
          group_size_normalized: conversation_data.groupSizeNormalized,
          wine_prefs_raw: conversation_data.winePrefs,
          wine_type: conversation_data.wineType,
          wine_varietals: conversation_data.wineVarietals,
          vibe_raw: conversation_data.vibe,
          vibe_normalized: conversation_data.vibeNormalized,
          logistics_raw: conversation_data.logistics,
          reservations_ok: conversation_data.reservationsOk,
          max_drive_minutes: conversation_data.maxDriveMinutes,
          transportation_raw: conversation_data.transportation,
          has_dd: conversation_data.hasDD,
          needs_tour_service: conversation_data.needsTourService,
          addons_raw: conversation_data.addons,
          wants_lunch: conversation_data.wantsLunch,
          wants_other_activities: conversation_data.wantsOtherActivities,
          other_activities: conversation_data.otherActivities,
          full_data: conversation_data,
        }, {
          onConflict: 'session_id'
        })

      if (error) throw error

      return Response.json({ success: true })
    }

    // ========================================================================
    // ACTION: Save generated itinerary
    // ========================================================================
    if (action === 'itinerary') {
      // Save itinerary
      const { data: itinerary, error: itineraryError } = await supabase
        .from('generated_itineraries')
        .insert({
          session_id,
          itinerary_markdown: itinerary_data.markdown,
          wineries: itinerary_data.wineries,
          total_drive_time: itinerary_data.totalDriveTime,
          share_token: itinerary_data.share_token,
        })
        .select()
        .single()

      if (itineraryError) throw itineraryError

      // Update session
      await supabase
        .from('conversation_sessions')
        .update({
          itinerary_generated: true,
        })
        .eq('session_id', session_id)

      return Response.json({ 
        success: true,
        itinerary_id: itinerary.id,
        share_token: itinerary.share_token
      })
    }

    // ========================================================================
    // ACTION: Mark conversation complete
    // ========================================================================
    if (action === 'complete') {
      const { error } = await supabase
        .from('conversation_sessions')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: metadata?.duration_seconds,
          conversation_completed: true,
          quick_plan_mode: metadata?.quick_plan_mode,
        })
        .eq('session_id', session_id)

      if (error) throw error

      return Response.json({ success: true })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Save conversation error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// ============================================================================
// Database function for incrementing message count
// Run this SQL in Supabase to create the function:
// ============================================================================
/*
CREATE OR REPLACE FUNCTION increment_message_count(p_session_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE conversation_sessions
  SET total_messages = total_messages + 1
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;
*/