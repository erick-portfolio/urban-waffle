import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { App, TerraformStack, CloudBackend, NamedCloudWorkspace  } from "cdktf";

import { Construct } from "constructs";
import { Posts } from "./posts";
// import { LocalProvider } from "@cdktf/provider-local/lib/provider";

type Stage =  "development" | "production";

interface StageOptions {
  stage: Stage;
  user?: string;
}

const app = new App();



class PostsStack extends TerraformStack {
  public posts: Posts;

  constructor(scope: Construct,name: string, public options: StageOptions) {
    super(scope, name);

    new AwsProvider(this, "aws", { 
      region: "us-east-1", 
      accessKey: assertAwsAccessKey(process.env.AWS_ACCESS_KEY_ID),
      secretKey: assertAwsSecretAccessKey(process.env.AWS_SECRET_ACCESS_KEY),
    });

    this.posts = new Posts(this, "posts", {
      stage: options.stage,
    });
  }
}

const stack = new PostsStack(app, "organization", {
  stage: assertStage(process.env.STAGE),

});
new CloudBackend(stack, {
  hostname: "app.terraform.io",
  organization: "NotErickG",
  workspaces: new NamedCloudWorkspace("posts"),
  token: process.env.TFE_TOKEN,
});


app.synth();


// try to see if the process.env.STAGE can be casted to type Stage
// throw an error if it cannot
function assertStage(stage: string | undefined): Stage {
  if (stage === undefined) {
    return "production";
  }
  if (stage === "development" || stage === "production") {
    return stage;
  }
  throw new Error(`Invalid stage: ${stage}`);
}

// function to see if the process.env.AWS_ACCESS_KEY_ID is undefined or empty
// throw an error if it is
function assertAwsAccessKey(awsAccessKeyId: string | undefined): string {
  if (awsAccessKeyId === undefined || awsAccessKeyId === "") {
    throw new Error("AWS_ACCESS_KEY_ID is undefined or empty. Please set the AWS_ACCESS_KEY_ID environment variable to your AWS Access Key ID.");
  }
  return awsAccessKeyId;
}

// function to see if the process.env.AWS_SECRET_ACCESS_KEY is undefined or empty
// throw an error if it is
function assertAwsSecretAccessKey(awsSecretAccessKey: string | undefined): string {
  if (awsSecretAccessKey === undefined || awsSecretAccessKey === "") {
    throw new Error("AWS_SECRET_ACCESS_KEY is undefined or empty. Please set the AWS_SECRET_ACCESS_KEY environment variable to your AWS Secret Access Key.");
  }
  return awsSecretAccessKey;
}
