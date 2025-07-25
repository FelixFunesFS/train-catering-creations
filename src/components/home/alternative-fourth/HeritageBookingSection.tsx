import { useState } from "react";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ChefHat, Phone, Calendar, MapPin, Users, Clock, Heart, CheckCircle } from "lucide-react";

export const HeritageBookingSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation({
    threshold: 0.1,
    variant: 'fade-up'
  });

  const { ref: formRef, isVisible: formVisible } = useScrollAnimation({
    threshold: 0.1,
    variant: 'slide-up'
  });

  const [selectedService, setSelectedService] = useState("wedding");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    guestCount: "",
    venue: "",
    message: ""
  });

  const services = [
    {
      id: "wedding",
      name: "Wedding Celebrations",
      description: "Creating magical moments for your Charleston love story",
      icon: Heart,
      features: ["Custom menu planning", "Venue coordination", "Family recipe consultations", "Day-of service"],
      startingPrice: "Starting at $85/person"
    },
    {
      id: "corporate",
      name: "Corporate Events",
      description: "Professional service for business gatherings",
      icon: Users,
      features: ["Executive lunch service", "Corporate gala catering", "Meeting refreshments", "Team building events"],
      startingPrice: "Starting at $35/person"
    },
    {
      id: "family",
      name: "Family Celebrations",
      description: "Bringing generations together around exceptional food",
      icon: ChefHat,
      features: ["Anniversary parties", "Reunion catering", "Holiday celebrations", "Birthday festivities"],
      startingPrice: "Starting at $45/person"
    },
    {
      id: "venue",
      name: "Historic Venue Events",
      description: "Specialized service for Charleston's treasured locations",
      icon: MapPin,
      features: ["Rainbow Row events", "Plantation celebrations", "Garden party service", "Waterfront dining"],
      startingPrice: "Custom pricing"
    }
  ];

  const whyChooseUs = [
    {
      title: "Personal Chef Consultation",
      description: "Speak directly with Chef Train or Chef Tanya about your vision",
      icon: ChefHat
    },
    {
      title: "Charleston Venue Expertise",
      description: "20+ years of experience with every historic venue in Charleston",
      icon: MapPin
    },
    {
      title: "Family Recipe Traditions",
      description: "Authentic Southern cuisine passed down through generations",
      icon: Heart
    },
    {
      title: "Full-Service Excellence",
      description: "From planning to cleanup, we handle every detail with care",
      icon: CheckCircle
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-red-600/5">
      <ResponsiveWrapper>
        
        {/* Section Header with Logo */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
              alt="Soul Train's Eatery - Charleston Event Planning"
              className="h-16 md:h-20 w-auto mx-auto mb-4"
            />
          </div>
          
          <h2 className={`font-elegant text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Plan Your
            <span className="block font-script bg-gradient-ruby-primary bg-clip-text text-transparent text-2xl md:text-4xl lg:text-5xl mt-2">
              Charleston Celebration
            </span>
          </h2>
          <p className={`font-clean text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-700 delay-200 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Let our family help create your perfect Charleston event. With over 20 years of experience 
            and deep knowledge of every venue, we'll make your celebration unforgettable.
          </p>
        </div>

        {/* Service Selection */}
        <div className="mb-16">
          <h3 className="font-playfair text-2xl md:text-3xl font-bold text-center mb-8">
            Choose Your Celebration Style
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                  selectedService === service.id
                    ? 'border-red-600 bg-red-600/5 shadow-lg'
                    : 'border-border hover:border-red-600/50 hover:bg-red-600/5'
                }`}
              >
                <service.icon className={`w-8 h-8 mb-4 ${
                  selectedService === service.id ? 'text-red-600' : 'text-muted-foreground'
                }`} />
                <h4 className="font-playfair text-lg font-bold mb-2">{service.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                <p className="text-sm font-semibold text-red-600">{service.startingPrice}</p>
              </button>
            ))}
          </div>

          {/* Selected Service Details */}
          {selectedService && (
            <SectionContentCard className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const service = services.find(s => s.id === selectedService);
                      const Icon = service?.icon || ChefHat;
                      return <Icon className="w-6 h-6 text-red-600" />;
                    })()}
                    <h4 className="font-playfair text-2xl font-bold">
                      {services.find(s => s.id === selectedService)?.name}
                    </h4>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    {services.find(s => s.id === selectedService)?.description}
                  </p>
                  
                  <h5 className="font-semibold mb-4">What's Included:</h5>
                  <ul className="space-y-2">
                    {services.find(s => s.id === selectedService)?.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-accent/20 rounded-lg p-6">
                  <h5 className="font-playfair text-xl font-bold mb-4">Ready to Start Planning?</h5>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Get a personalized consultation with Chef Train or Chef Tanya to discuss your vision, 
                    venue options, and family traditions.
                  </p>
                  <div className="flex flex-col gap-3">
                    <NeumorphicButton
                      variant="primary"
                      className="bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white focus-visible-enhanced"
                      aria-label="Call Soul Train's Eatery directly"
                    >
                      <Phone className="w-4 h-4" />
                      Call (843) 555-0123
                    </NeumorphicButton>
                    <NeumorphicButton
                      variant="outline"
                      className="border-primary text-primary hover:bg-gradient-ruby-primary hover:text-white focus-visible-enhanced"
                      aria-label="Schedule a consultation with our chefs"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Consultation
                    </NeumorphicButton>
                  </div>
                </div>
              </div>
            </SectionContentCard>
          )}
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h3 className="font-playfair text-2xl md:text-3xl font-bold text-center mb-8">
            The Soul Train's
            <span className="block font-dancing text-red-600 text-xl md:text-2xl mt-1">
              Family Difference
            </span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => (
              <SectionContentCard key={index} className="text-center">
                <item.icon className="w-8 h-8 text-red-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </SectionContentCard>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div ref={formRef} className={`transition-all duration-700 ${formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <SectionContentCard className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="font-playfair text-2xl md:text-3xl font-bold mb-4">
                Let's Plan Something
                <span className="block font-dancing text-red-600 text-xl md:text-2xl mt-1">
                  Beautiful Together
                </span>
              </h3>
              <p className="text-muted-foreground">
                Tell us about your Charleston celebration and we'll create a personalized proposal just for you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-colors duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-colors duration-200"
                    placeholder="(843) 555-0123"
                  />
                </div>
                
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-medium mb-2">Event Date</label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="guestCount" className="block text-sm font-medium mb-2">Expected Guest Count</label>
                  <select
                    id="guestCount"
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-colors duration-200"
                  >
                    <option value="">Select guest count</option>
                    <option value="10-25">10-25 guests</option>
                    <option value="25-50">25-50 guests</option>
                    <option value="50-100">50-100 guests</option>
                    <option value="100-200">100-200 guests</option>
                    <option value="200+">200+ guests</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="venue" className="block text-sm font-medium mb-2">Venue or Location</label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-colors duration-200"
                    placeholder="Venue name or 'Need help choosing'"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">Tell Us About Your Vision</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-colors duration-200 resize-vertical"
                  placeholder="Share any special details, dietary requirements, family traditions, or questions you have..."
                />
              </div>
              
              <div className="text-center">
                <NeumorphicButton
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white px-8 py-4 min-w-[200px] focus-visible-enhanced"
                  aria-label="Submit event planning form"
                >
                  <Heart className="w-5 h-5" />
                  Start Planning Your Event
                </NeumorphicButton>
                
                <p className="text-sm text-muted-foreground mt-4">
                  We'll respond within 24 hours with a personalized consultation offer.
                </p>
              </div>
            </form>
          </SectionContentCard>
        </div>

        {/* Quick Contact Options */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <SectionContentCard className="text-center">
              <Phone className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Call Us Direct</h4>
              <p className="text-muted-foreground text-sm mb-3">
                Speak with Chef Train or Chef Tanya
              </p>
              <a
                href="tel:+18435550123"
                className="text-red-600 font-medium hover:text-red-700 transition-colors duration-200"
              >
                (843) 555-0123
              </a>
            </SectionContentCard>
            
            <SectionContentCard className="text-center">
              <Calendar className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Schedule Tasting</h4>
              <p className="text-muted-foreground text-sm mb-3">
                Experience our Charleston favorites
              </p>
              <button className="text-red-600 font-medium hover:text-red-700 transition-colors duration-200">
                Book Tasting
              </button>
            </SectionContentCard>
            
            <SectionContentCard className="text-center">
              <Clock className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Same-Day Service</h4>
              <p className="text-muted-foreground text-sm mb-3">
                Last-minute event? We can help
              </p>
              <button className="text-red-600 font-medium hover:text-red-700 transition-colors duration-200">
                Emergency Catering
              </button>
            </SectionContentCard>
          </div>
        </div>
      </ResponsiveWrapper>
    </section>
  );
};