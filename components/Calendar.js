export default function Calendar() {
  const calendlyWidgetStyle = { minWidth: '320px', height: '700px' };

  return (
    <section id="calendly-widget" className="calendar-widget-section">
      <div className="calendar-widget-content">
        <div className="calendar-widget">
          <div className="calendly-inline-widget" 
               data-url="https://calendly.com/brightmindvision/ai-consultation?email=contact@brightmindvision.com" 
               style={calendlyWidgetStyle}>
          </div>
        </div>
      </div>
    </section>
  );
}
