# Solar Landscaping Customer Registration Demo
[GitHub repository](https://github.com/nicehatharry/SolarLandscaping)

## to explore
* run the frontend locally with `npm run dev`
* fill out the initial customer information
* submission will show standardized address and utility company
(only zip codes in NJ have associated utility companies)
  * utility companies are matched to a dictionary retrieved from S3
  * the UI backend is served in EC2
  * submissions are stored in a separate S3 database

## process
This application was bootstrapped using Claude Sonnet 4.5. My initial concept was to solve customer registration over a two step wizard process, taking customer info on the first page and confirming standardized information and utility service on the second. Implementing the utility ID validation would be trivial at this point, but fell outside the 3h timebox. Instead, I opted to gamble on cloud deployment, and achieved 80% success.

The backend and data are all cloud deployed to AWS (AWS was chosen because my personal site is hosted here, so I utilized my existing account). The backend is hosted on an EC2 virtual machine with IAM access to the data, stored in S3. The UI is also cloud deployed, but permissioning issues were stopping the css from being able to resolve which resulted in a terrible user experience, so I have opted instead to exhibit the locally hosted incarnation, which is much friendlier.

Submission data is also stored to S3 in JSON format, but could easily be converted to some flavor of SQL or hosted in a more specialized NoSQL service depending on future access requirements. This information is currently only available with administrator access. I am happy to confirm application function by confirming data submitted to the service.

## for the future
There were some requirements I was unable to squeeze into the 3h timebox (and I did go over in troubleshooting some cloud issues), so firstly I would solve those:
* Customer Utility ID storage and validation
* Inferring address values and making some fields optional
* More explicit options with recommended address storage

Beyond that, I would:
* productionalize the application for https
* do some cloud environment security cleanup
* clean up accessibility
* handle known but unsupported utility companies
* consider storing our own database of imported and cleaned utility data
* consider a single-page form approach
* improve the final landing page

## motivating questions
1. *If a subscriber stops the process, what should we do with the data they have already inputted?*
    * This should be informed by data privacy agreements and the laws where the customer resides. The simplest answer would be to delete customer data on customer egress, but there are many reasons why that might be undesirable both for the customer and the company. Almost certainly there should be some historical database of customer (and previous customer) information maintained.
1. *Should this be single page enrollment? Should it be paginated?*
    * I also wrestled with this question. In the end, I used a multi-page approach to keep address validation and utility company inference visually clean, but had no strong preference either way.
1. *What is the minimal set of information required from the subscriber that we need to collect? Can information be derived?*
    * There is certainly some information that can be derived from the address and census data. I found street addresses could be corrected somewhat and zip code could be entirely derived.
1. *What consistency checks can be applied for this information? If these consistency checks fail, should the enrollment fail until the subscriber enters the correct information?*
    * I'm unclear on what exactly this question is asking about. Consistency between US Census data and customer input? If so, we could soft reject (e.g. "We are unable to process your information at this time.") customer data that strayed too far from US Census data, or hedge our bets by storing both customer input and recommended US Census data if both could be useful by a downstream service. Without a better understanding of the consequences of this data, it is difficult to form a serious opinion on the danger of storing improper customer data and the degree of our motivation is to reject it.
1. *How would you secure the PII?*
    * Being designed to be open to the public, our best security options would be to lock down backend processes to only respond to UI requests, ensure input sanitization processes for any data going to a DB, and implement a CAPTCHA or similar feature to prevent nonhuman interaction.
1. *What design choices did you make to ensure the product can be used independent of technical background?*
    * The form is very simple and user friendly, including placeholder text to signal appropriate input and a separation of personal information from derived/inferred information to separate those sources in an intuitive way. No part of the form relies on technical (i.e. backend or database) interaction, so anyone who can mail themselves a letter can complete this form.