
import { businessProfile } from "../data/business-profile.js";

export function getBusinessKnowledge() {

    const { name, description, focus, website, contact } = businessProfile;

    return `
================================
D.O.T INTERNATIONAL
BUSINESS KNOWLEDGE BASE
================================

COMPANY INFORMATION

Company Name:
${name}

Description:
${description}

Website:
${website}


BUSINESS FOCUS

The following areas are listed in the
available company information:

${focus.map((item, index) => `${index + 1}. ${item}`).join("\n")}

Do not assume additional services or
specific capabilities beyond these categories.


CONTACT INFORMATION

Phone:
${contact.phone}

Email:
${contact.email}

Address:
${contact.address}

Working Hours:
${contact.workingHours}


================================
INFORMATION NOT YET AVAILABLE
================================

The following business information has
not been provided:

- Detailed service descriptions
- Project pricing and quotations
- Minimum project budgets
- Payment and advance payment terms
- Refund and cancellation policies
- Warranty information
- Project completion timelines
- Appointment availability
- Site visit procedures
- Project execution procedures
- Customer testimonials
- Completed project details


================================
KNOWLEDGE AND RESPONSE RULES
================================

1. Treat the information above as the
   only currently available source of
   company-specific information.

2. Never invent company services,
   policies, prices or commitments.

3. Do not assume that a service category
   means every related service is offered.

4. For questions about unavailable
   information, acknowledge the limitation.

5. Offer to connect the customer with
   a business representative when
   confirmation is necessary.

6. You may use your general knowledge
   of interior design, exhibitions and
   event management to explain concepts.

7. However, never present general industry
   knowledge as an official D.O.T policy
   or confirmed company capability.

8. Never claim that an enquiry, booking
   or appointment has been submitted
   unless the backend confirms it.

================================
END OF BUSINESS KNOWLEDGE
================================
`;
}
