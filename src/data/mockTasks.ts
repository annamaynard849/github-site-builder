
import { TaskData } from '@/components/TaskCard';

export const mockTasks: TaskData[] = [
  // Urgent Needs (First 48 Hours)
  {
    id: 'arrange-care-pets-dependents',
    title: 'Arrange care for pets or dependents',
    status: 'not-started',
    category: 'Urgent Needs (First 48 Hours)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'ASAP',
    description: 'Ensure pets and dependents have immediate care and supervision.'
  },
  {
    id: 'secure-major-property',
    title: 'Secure major property (home, vehicle, valuables)',
    status: 'in-progress',
    category: 'Urgent Needs (First 48 Hours)',
    assignee: { name: 'Aunt Sarah', avatar: undefined },
    dueDate: 'Today',
    description: 'Secure home, vehicle, and valuable items to prevent loss or theft.'
  },
  {
    id: 'thorough-home-check',
    title: 'Perform a more thorough home check',
    status: 'not-started',
    category: 'Urgent Needs (First 48 Hours)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'Today',
    description: 'Check for perishable food, plants, mail, and other items needing attention.'
  },
  {
    id: 'notify-close-family-friends',
    title: 'Notify close family and friends',
    status: 'complete',
    category: 'Urgent Needs (First 48 Hours)',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: 'Completed',
    description: 'Inform immediate family and close friends of the passing.'
  },
  {
    id: 'notify-broader-community',
    title: 'Notify the broader community',
    status: 'not-started',
    category: 'Urgent Needs (First 48 Hours)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'Tomorrow',
    description: 'Inform colleagues, acquaintances, and community members.'
  },
  {
    id: 'retrieve-personal-property',
    title: 'Retrieve personal property from hospitals, care facilities, or workplaces',
    status: 'not-started',
    category: 'Urgent Needs (First 48 Hours)',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: 'This week',
    description: 'Collect personal belongings from medical facilities and workplace.'
  },
  {
    id: 'select-funeral-home',
    title: 'Select a funeral home or other provider',
    status: 'complete',
    category: 'Urgent Needs (First 48 Hours)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'Completed',
    description: 'Choose and contact funeral home or crematory services.'
  },
  {
    id: 'decide-disposition-method',
    title: 'Decide on a method of disposition (burial, cremation, donation)',
    status: 'not-started',
    category: 'Urgent Needs (First 48 Hours)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Determine burial, cremation, or body donation arrangements.'
  },
  {
    id: 'confirm-traditions',
    title: 'Confirm religious, cultural, or personal traditions to honor',
    status: 'not-started',
    category: 'Urgent Needs (First 48 Hours)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Identify important traditions and customs to include in services.'
  },
  {
    id: 'order-death-certificates',
    title: 'Order death certificates',
    status: 'in-progress',
    category: 'Urgent Needs (First 48 Hours)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'Tomorrow',
    description: 'Order multiple certified copies of death certificate.'
  },
  {
    id: 'notify-employer-school',
    title: "Notify the person's employer or school",
    status: 'not-started',
    category: 'Urgent Needs (First 48 Hours)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Contact employer or educational institution about the passing.'
  },

  // Memorial Planning (only if holding a service)
  {
    id: 'decide-service-type',
    title: "Decide what type of funeral, memorial, or celebration of life you'd like to have",
    status: 'not-started',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'Next week',
    description: 'Choose the style and format of memorial service.'
  },
  {
    id: 'choose-venue',
    title: 'Choose a venue',
    status: 'not-started',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'Next week',
    description: 'Select location for memorial service or celebration.'
  },
  {
    id: 'set-date-time',
    title: 'Set the date and time',
    status: 'not-started',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'Next week',
    description: 'Schedule the memorial service date and time.'
  },
  {
    id: 'choose-participants',
    title: 'Choose participants (speakers, officiant, pallbearers, etc.)',
    status: 'not-started',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: 'Next week',
    description: 'Select people to participate in the service.'
  },
  {
    id: 'determine-order-events',
    title: 'Determine the order of events',
    status: 'not-started',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'Next week',
    description: 'Plan the sequence and flow of the memorial service.'
  },
  {
    id: 'decide-livestream',
    title: 'Decide whether to livestream the event',
    status: 'not-started',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: 'Next week',
    description: 'Consider virtual attendance options for distant family and friends.'
  },
  {
    id: 'order-printed-programs',
    title: 'Order printed programs',
    status: 'not-started',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'Next week',
    description: 'Design and order memorial service programs.'
  },
  {
    id: 'create-videos-slideshows',
    title: 'Create any desired videos or photo slideshows',
    status: 'not-started',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Aunt Sarah', avatar: undefined },
    dueDate: 'Next week',
    description: 'Prepare multimedia presentations for the service.'
  },
  {
    id: 'order-flowers-decor',
    title: 'Order flowers and other décor',
    status: 'not-started',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: 'Next week',
    description: 'Arrange floral arrangements and decorations.'
  },
  {
    id: 'coordinate-food-drinks',
    title: 'Coordinate food and drinks',
    status: 'not-started',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Aunt Sarah', avatar: undefined },
    dueDate: 'Next week',
    description: 'Plan catering or coordinate potluck arrangements.'
  },
  {
    id: 'memorial-donations-fund',
    title: 'Give direction on memorial donations / set up a memorial fund',
    status: 'not-started',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'Next week',
    description: 'Establish charitable giving options in their memory.'
  },
  {
    id: 'write-eulogy',
    title: 'Write your eulogy',
    status: 'not-started',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'Next week',
    description: 'Prepare personal remarks for the memorial service.'
  },
  {
    id: 'write-obituary',
    title: 'Write an obituary',
    status: 'in-progress',
    category: 'Memorial Planning (only if holding a service)',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: '3 days',
    description: 'Draft obituary for publication in newspapers and online.'
  },

  // Legal & Financial
  {
    id: 'start-probate-process',
    title: 'Start the probate process',
    status: 'not-started',
    category: 'Legal & Financial',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This month',
    description: 'Begin legal process to settle the estate.'
  },
  {
    id: 'settle-trusts',
    title: 'Settle any trusts',
    status: 'not-started',
    category: 'Legal & Financial',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This month',
    description: 'Handle trust administration and distribution.'
  },
  {
    id: 'request-will-trust-copies',
    title: 'Request multiple copies of the will or trust',
    status: 'complete',
    category: 'Legal & Financial',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'Completed',
    description: 'Obtain certified copies of legal documents.'
  },
  {
    id: 'apply-social-security-benefits',
    title: 'Apply for Social Security survivor benefits',
    status: 'not-started',
    category: 'Legal & Financial',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'ASAP',
    description: 'Contact SSA for survivor benefit applications.'
  },
  {
    id: 'apply-veterans-benefits',
    title: 'Apply for veterans benefits',
    status: 'not-started',
    category: 'Legal & Financial',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This month',
    description: 'Contact VA for burial and survivor benefits if applicable.'
  },
  {
    id: 'ask-employer-benefits',
    title: 'Ask about employer benefits',
    status: 'not-started',
    category: 'Legal & Financial',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Inquire about life insurance, pension, and other employer benefits.'
  },
  {
    id: 'notify-life-insurance',
    title: 'Notify life insurance companies',
    status: 'not-started',
    category: 'Legal & Financial',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Contact all life insurance providers to file claims.'
  },
  {
    id: 'notify-health-insurance',
    title: 'Notify health insurance provider',
    status: 'not-started',
    category: 'Legal & Financial',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Cancel health insurance coverage and handle final claims.'
  },
  {
    id: 'notify-lenders',
    title: 'Notify lenders (mortgage, car loan, personal loans)',
    status: 'not-started',
    category: 'Legal & Financial',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Contact all loan providers about the death.'
  },
  {
    id: 'hire-tax-accountant',
    title: 'Hire a tax accountant',
    status: 'not-started',
    category: 'Legal & Financial',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This month',
    description: 'Find professional help for final tax returns and estate taxes.'
  },
  {
    id: 'get-legal-financial-support',
    title: 'Get additional legal or financial support',
    status: 'not-started',
    category: 'Legal & Financial',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'As needed',
    description: 'Consult attorneys, financial advisors, or other professionals.'
  },
  {
    id: 'remove-marketing-lists',
    title: 'Remove from marketing/mailing lists (Do Not Contact)',
    status: 'not-started',
    category: 'Legal & Financial',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: 'This month',
    description: 'Register with deceased do not contact registries.'
  },

  // Home, Property & Accounts
  {
    id: 'find-close-bank-accounts',
    title: 'Find and close bank accounts',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Locate and close all checking, savings, and other bank accounts.'
  },
  {
    id: 'close-credit-cards',
    title: 'Close credit cards',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: 'This week',
    description: 'Cancel all credit card accounts and pay final balances.'
  },
  {
    id: 'find-transfer-investments',
    title: 'Find and transfer investment accounts',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This month',
    description: 'Locate and handle transfer of stocks, bonds, and retirement accounts.'
  },
  {
    id: 'cancel-online-payment-accounts',
    title: 'Cancel and transfer money from online payment accounts (PayPal, Venmo, etc.)',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: 'This week',
    description: 'Close digital payment platforms and transfer remaining balances.'
  },
  {
    id: 'cancel-transfer-insurance',
    title: 'Cancel or transfer insurance policies (home, auto, etc.)',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Handle property and vehicle insurance policies.'
  },
  {
    id: 'notify-car-lenders',
    title: 'Notify any car lenders',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Contact auto loan companies about vehicle ownership transfer.'
  },
  {
    id: 'notify-mortgage-landlord',
    title: 'Notify mortgage company or landlord',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Inform housing-related parties about the death.'
  },
  {
    id: 'notify-utility-companies',
    title: 'Notify utility companies',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: '2 weeks',
    description: 'Contact electric, gas, water, and trash service providers.'
  },
  {
    id: 'notify-cell-service',
    title: 'Notify cell service provider',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Aunt Sarah', avatar: undefined },
    dueDate: 'This week',
    description: 'Cancel or transfer mobile phone service.'
  },
  {
    id: 'notify-cable-internet',
    title: 'Notify cable and internet provider(s)',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Aunt Sarah', avatar: undefined },
    dueDate: 'This week',
    description: 'Cancel or transfer cable TV and internet services.'
  },
  {
    id: 'cancel-ids',
    title: 'Cancel IDs (driver\'s license, passport, state ID)',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This month',
    description: 'Notify DMV and passport office to cancel identification documents.'
  },
  {
    id: 'close-email-accounts',
    title: 'Close email accounts',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: 'Next month',
    description: 'Close personal email accounts after backing up important messages.'
  },
  {
    id: 'close-online-accounts',
    title: 'Close other online accounts',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: 'Next month',
    description: 'Cancel shopping, streaming, and other online service accounts.'
  },
  {
    id: 'memorialize-facebook',
    title: 'Memorialize their Facebook page',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: 'Next month',
    description: 'Convert social media profiles to memorial accounts.'
  },
  {
    id: 'cancel-online-subscriptions',
    title: 'Cancel online subscriptions',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Aunt Sarah', avatar: undefined },
    dueDate: 'Next week',
    description: 'Cancel streaming services, apps, and digital subscriptions.'
  },
  {
    id: 'cancel-physical-subscriptions',
    title: 'Cancel physical subscriptions (magazines, meal kits, etc.)',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Aunt Sarah', avatar: undefined },
    dueDate: 'Next week',
    description: 'Cancel magazines, meal delivery, and other physical subscriptions.'
  },
  {
    id: 'start-going-through-mail',
    title: 'Start going through the mail',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Review accumulated mail for important documents and bills.'
  },
  {
    id: 'forward-mail-usps',
    title: 'Forward mail with USPS',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Me', avatar: undefined },
    dueDate: 'This week',
    description: 'Set up mail forwarding to ensure important correspondence is received.'
  },
  {
    id: 'backup-personal-devices',
    title: 'Back up personal devices and accounts',
    status: 'not-started',
    category: 'Home, Property & Accounts',
    assignee: { name: 'Family & Friends', avatar: undefined },
    dueDate: 'This month',
    description: 'Preserve photos, documents, and other digital memories.'
  }
];

export const taskCategories = [
  'Urgent Needs (First 48 Hours)',
  'Memorial Planning (only if holding a service)', 
  'Legal & Financial',
  'Home, Property & Accounts',
  'Other'
];
