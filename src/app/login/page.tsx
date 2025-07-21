"use client";

import React, { useState } from "react";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  // CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/client";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type FormValues = {
  email: string;
  password: string;
};

const supabase = createClient();

export default function Page() {
  return (
    <div className="relative flex w-full h-screen items-center justify-center overflow-hidden">
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
        )}
      />
      <div className="flex w-full max-w-md flex-col gap-6 p-4">
        <Tabs defaultValue="register">
          <TabsList>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <AuthCard title="Create an Account">
              <RegisterForm />
            </AuthCard>
          </TabsContent>

          <TabsContent value="login">
            <AuthCard title="Welcome Back TixAI!">
              <LoginForm />
            </AuthCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AuthCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">{children}</CardContent>
    </Card>
  );
}

function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMsg(null);
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) setErrorMsg(error.message);
      setLoading(false);
      toast.info("Please Confirm Email");
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="grid gap-4">
      <div className="grid gap-1">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="you@example.com"
          {...formik.getFieldProps("email")}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-sm text-red-600">{formik.errors.email}</p>
        )}
      </div>

      <div className="grid gap-1">
        <Label htmlFor="reg-password">Password</Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="••••••••"
          {...formik.getFieldProps("password")}
        />
        {formik.touched.password && formik.errors.password && (
          <p className="text-sm text-red-600">{formik.errors.password}</p>
        )}
      </div>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Register"}
      </Button>
    </form>
  );
}

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMsg(null);
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) setErrorMsg(error.message);
      setLoading(false);
      if (!error) {
        toast.success("Login Success");
        window.location.replace(`${window.location.origin}/organizations/home`);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="grid gap-4">
      <div className="grid gap-1">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          {...formik.getFieldProps("email")}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-sm text-red-600">{formik.errors.email}</p>
        )}
      </div>

      <div className="grid gap-1">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          {...formik.getFieldProps("password")}
        />
        {formik.touched.password && formik.errors.password && (
          <p className="text-sm text-red-600">{formik.errors.password}</p>
        )}
      </div>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Login"}
      </Button>

      {/* <div className="mt-4 flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
        >
          Google
        </Button>
        <Button
          variant="outline"
          onClick={() => supabase.auth.signInWithOAuth({ provider: "github" })}
        >
          <Github className="mr-2 h-4 w-4" /> GitHub
        </Button>
      </div> */}
    </form>
  );
}
