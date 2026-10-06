import React, { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import FamilyProductsCatalog from "../components/family/FamilyProductsCatalog";
import { normalizeFamilyRecipient } from "../utils/familyNavigation";
import Loader from "../../shared/components/Loader";
import { usePublicCmsPage } from "../hooks/usePublicCmsPage";

const recipientLabels = {
  all: "Family Collections",
  mother: "Mother Collections",
  father: "Father Collections",
  brother: "Brother Collections",
  sister: "Sister Collections",
  husband: "Husband Collections",
  wife: "Wife Collections",
};

const FamilyRecipientProductsPage = () => {
  const { recipient } = useParams();
  const selectedRecipient = normalizeFamilyRecipient(recipient);
  const {
    data: sections = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePublicCmsPage("shop-family");

  useEffect(() => {
    document.title = `${recipientLabels[selectedRecipient] || "Family Collections"} | Alankarr Jewellers`;
  }, [selectedRecipient]);

  const sectionMap = useMemo(
    () =>
      (sections || []).reduce((acc, section) => {
        const key = section.sectionKey || section.sectionId;
        if (key) acc[key] = section;
        return acc;
      }, {}),
    [sections],
  );

  if (isLoading) return <Loader />;
  if (isError) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-6 py-14">
        <div className="max-w-xl w-full bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">
            Gifts for Family
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900">
            Unable to load page content
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            {error?.response?.data?.message ||
              error?.message ||
              "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-plum px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-brand-plum hover:text-brand-champagne-light transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-brand-espresso font-sans overflow-x-hidden">
      <div className="border-b border-brand-border bg-brand-pearl">
        <div className="container mx-auto px-4 md:px-8 py-4 md:py-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-champagne">
              Gifts for Family
            </p>
            <h1 className="mt-1 font-serif text-2xl md:text-4xl text-brand-espresso">
              {recipientLabels[selectedRecipient] || "Family Collections"}
            </h1>
          </div>

          <Link
            to="/category/family"
            className="inline-flex items-center justify-center rounded-full border border-brand-border bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-espresso transition-colors hover:bg-brand-pearl hover:border-brand-champagne hover:text-brand-champagne"
          >
            Back to Family
          </Link>
        </div>
      </div>

      <FamilyProductsCatalog
        selectedRecipient={selectedRecipient}
        sectionData={sectionMap["products-listing"]}
      />
    </div>
  );
};

export default FamilyRecipientProductsPage;
