'use client';

import {
  propertyProFaqData,
  propertyProFeaturesData,
  propertyProTestimonialData,
} from 'data/landing/propertypro';
import FAQSection from 'components/sections/pages/landing/homepage/FAQSection';
import Features from 'components/sections/pages/landing/homepage/features';
import Newsletter from 'components/sections/pages/landing/homepage/Newsletter';
import Pricing from 'components/sections/pages/landing/homepage/Pricing';
import Testimonial from 'components/sections/pages/landing/homepage/Testimonial';
import Hero from './Hero';

const PropertyProHomepage = () => {
  return (
    <>
      <Hero />
      <Features data={propertyProFeaturesData} />
      <Pricing />
      <Testimonial data={propertyProTestimonialData} />
      <FAQSection data={propertyProFaqData} />
      <Newsletter />
    </>
  );
};

export default PropertyProHomepage;
