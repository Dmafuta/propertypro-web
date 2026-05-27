"use client";

import Box from "@mui/material/Box";
import {
  propertyProFaqData,
  propertyProFeaturesData,
  propertyProTestimonialData,
} from "data/landing/propertypro";
import FAQSection from "components/sections/pages/landing/homepage/FAQSection";
import Features from "components/sections/pages/landing/homepage/features";
import Newsletter from "components/sections/pages/landing/homepage/Newsletter";
import Pricing from "components/sections/pages/landing/homepage/Pricing";
import Testimonial from "components/sections/pages/landing/homepage/Testimonial";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import StatsBar from "./StatsBar";

const PropertyProHomepage = () => {
  return (
    <>
      <Box id="hero">
        <Hero />
      </Box>

      <StatsBar />

      <Box id="features">
        <Features data={propertyProFeaturesData} />
      </Box>

      <HowItWorks />

      <Box id="pricing">
        <Pricing />
      </Box>

      <Testimonial data={propertyProTestimonialData} />

      <Box id="faq">
        <FAQSection data={propertyProFaqData} />
      </Box>

      <Newsletter />
    </>
  );
};

export default PropertyProHomepage;
