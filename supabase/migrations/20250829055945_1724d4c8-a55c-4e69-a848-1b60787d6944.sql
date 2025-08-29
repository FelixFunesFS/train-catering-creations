-- Fix the function security issue by setting search_path
CREATE OR REPLACE FUNCTION public.log_quote_request_changes()
RETURNS TRIGGER AS $$
DECLARE
  field_name TEXT;
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- Only log if this is an UPDATE operation
  IF TG_OP = 'UPDATE' THEN
    -- Check each field for changes and log them
    IF OLD.contact_name IS DISTINCT FROM NEW.contact_name THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'contact_name', OLD.contact_name, NEW.contact_name, 'admin');
    END IF;
    
    IF OLD.email IS DISTINCT FROM NEW.email THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'email', OLD.email, NEW.email, 'admin');
    END IF;
    
    IF OLD.phone IS DISTINCT FROM NEW.phone THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'phone', OLD.phone, NEW.phone, 'admin');
    END IF;
    
    IF OLD.event_name IS DISTINCT FROM NEW.event_name THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'event_name', OLD.event_name, NEW.event_name, 'admin');
    END IF;
    
    IF OLD.event_date IS DISTINCT FROM NEW.event_date THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'event_date', OLD.event_date::TEXT, NEW.event_date::TEXT, 'admin');
    END IF;
    
    IF OLD.guest_count IS DISTINCT FROM NEW.guest_count THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'guest_count', OLD.guest_count::TEXT, NEW.guest_count::TEXT, 'admin');
    END IF;
    
    IF OLD.location IS DISTINCT FROM NEW.location THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'location', OLD.location, NEW.location, 'admin');
    END IF;
    
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'status', OLD.status::TEXT, NEW.status::TEXT, 'admin');
    END IF;
    
    IF OLD.service_type IS DISTINCT FROM NEW.service_type THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'service_type', OLD.service_type::TEXT, NEW.service_type::TEXT, 'admin');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';