# One-Time Schedules Demo

## Overview

This repository contains a demonstration of how to use the AWS Cloud Development Kit (CDK) to create one-time schedules using AWS EventBridge. In this demo, we will showcase how to schedule one-time events in AWS EventBridge and trigger AWS Lambda functions based on these schedules. This can be useful for running tasks or executing code at specific, one-time intervals.

![Architecture Overview](docs/Architecture%20Overview.png)

## Prerequisites

Before you begin, make sure you have the following prerequisites in place:

1. **AWS Account:** You will need an AWS account to deploy and run this projen CDK-based project.

2. **AWS CLI:** Ensure that you have the AWS CLI installed and configured with the necessary AWS credentials. You can install it following the instructions [here](https://aws.amazon.com/cli/).

3. **Node.js:** This project is built using Node.js, so make sure you have Node.js installed. You can download it from the [official website](https://nodejs.org/).

## Usage

To deploy and run this projen CDK-based project, follow these steps:

1. Clone this repository to your local machine:

```bash
git clone https://github.com/moralesl/one-time-schedules-demo.git
```


2. Navigate to the project directory:
```bash
cd one-time-schedules-demo
```


3. Install project dependencies:
```bash
npx projen
```


4. Deploy the CDK stack to your AWS account:
```bash
npx projen deploy
```


5. After the deployment is complete, the CDK will output an base URL, export it so that you can use it to trigger the API
```bash
export API_URL=<Set the output URL>
```

6. Populate the database, make sure that you have valid AWS credentials
```bash
npx projen create-products
```

This will populate the first 25 products

7. Set a range of products out of stock to observe the system
```bash
npx projen set-products-out-of-stock -a $API_URL -r 0-24
```


6. To clean up the resources, run the following command:
```bash
npx projen destroy
```

