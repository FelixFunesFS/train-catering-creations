import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/page-section";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { FAQSearch } from "@/components/faq/FAQSearch";
import { FAQCategoryFilter } from "@/components/faq/FAQCategoryFilter";
import { FAQAccordion } from "@/components/faq/FAQAccordion";
import { faqData, faqCategories } from "@/data/faqData";
import { HelpCircle, Phone, Mail, MessageCircle } from "lucide-react";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter FAQs based on search term and category
  const filteredFAQs = useMemo(() => {
    let filtered = faqData;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower) ||
        faq.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  // Count FAQs per category for filter badges
  const categoryMemberCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    faqCategories.forEach(category => {
      counts[category.id] = faqData.filter(faq => faq.category === category.id).length;
    });
    return counts;
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <PageSection pattern="a" withBorder skipToContentId="faq-header">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <PageHeader
            badge={{
              icon: <HelpCircle className="h-5 w-5" />,
              text: "Support"
            }}
            title="Frequently Asked Questions"
            subtitle="We're Here to Help"
            description="Find answers to common questions about our catering services, military base events, menu options, and more. Can't find what you're looking for? Contact us directly."
            buttons={[
              { text: "Contact Us", href: "tel:8439700265", variant: "default" },
              { text: "Request Quote", href: "/request-quote#page-header", variant: "outline" }
            ]}
          />
        </div>
      </PageSection>

      {/* Search and Filters */}
      <PageSection pattern="b">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="space-y-8">
            {/* Search Bar */}
            <FAQSearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            {/* Category Filters */}
            <FAQCategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categoryMemberCounts={categoryMemberCounts}
            />
          </div>
        </div>
      </PageSection>

      {/* FAQ Content */}
      <PageSection pattern="c">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <FAQAccordion 
            faqs={filteredFAQs}
            searchTerm={searchTerm}
          />
        </div>
      </PageSection>

      {/* Contact CTA */}
      <PageSection pattern="d" withBorder>
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <div className="neumorphic-card-3 rounded-2xl p-8 lg:p-12 relative overflow-hidden">
            {/* Watermark Logo */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <img 
                src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                alt="" 
                aria-hidden="true"
                className="w-32 h-32 object-contain opacity-[0.05]"
              />
            </div>
            <h2 className="text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-4">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Our team is here to help! Contact us directly for personalized assistance with your catering needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="cta" size="responsive-lg">
                <a href="tel:8439700265" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call (843) 970-0265
                </a>
              </Button>
              <Button asChild variant="cta-white" size="responsive-lg">
                <a href="mailto:soultrainseatery@gmail.com" className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Us
                </a>
              </Button>
              <Button asChild variant="outline" size="responsive-lg">
                <Link to="/request-quote#page-header" className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Request Quote
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </PageSection>
    </div>
  );
};

export default FAQ;
