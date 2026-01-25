import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/page-section";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { FAQSearch } from "@/components/faq/FAQSearch";
import { FAQCategoryFilter } from "@/components/faq/FAQCategoryFilter";
import { FAQAccordion } from "@/components/faq/FAQAccordion";
import { FAQVisualBreak } from "@/components/faq/FAQVisualBreak";
import { faqData, faqCategories } from "@/data/faqData";
import { HelpCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Scroll animations
  const { ref: searchRef, isVisible: searchVisible, variant: searchVariant } = useScrollAnimation({
    delay: 0,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 0 },
    desktop: { variant: "ios-spring", delay: 0 },
  });

  const { ref: accordionRef, isVisible: accordionVisible, variant: accordionVariant } = useScrollAnimation({
    delay: 100,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 50 },
    desktop: { variant: "fade-up", delay: 100 },
  });


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
            animated={true}
          />
        </div>
      </PageSection>

      {/* Search and Filters */}
      <PageSection pattern="b">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div 
            ref={searchRef}
            className={`space-y-8 ${useAnimationClass(searchVariant, searchVisible)}`}
          >
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
          <div 
            ref={accordionRef}
            className={useAnimationClass(accordionVariant, accordionVisible)}
          >
            <FAQAccordion 
              faqs={filteredFAQs}
              searchTerm={searchTerm}
            />
          </div>
        </div>
      </PageSection>

      {/* Visual Break Section - Now serves as final CTA */}
      <FAQVisualBreak />
    </div>
  );
};

export default FAQ;
