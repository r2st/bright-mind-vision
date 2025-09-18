import CustomCalendar from './CustomCalendar';

export default function Calendar() {
  return (
    <section id="calendly-widget" className="calendar-widget-section">
      <div className="calendar-widget-content">
        <div className="calendar-widget">
          <CustomCalendar />
        </div>
      </div>
    </section>
  );
}
