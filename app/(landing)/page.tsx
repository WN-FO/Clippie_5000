"use client";

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingHero } from '@/components/landing-hero';
import { LandingContent } from '@/components/landing-content';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Video, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { PLANS } from '@/constants/subscription-plans';

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="h-full">
      <LandingNavbar />
      <LandingHero />
      
      {/* Features Section */}
      <section className="container mx-auto py-20 px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight">How Clippie Works</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your long-form videos into engaging short-form clips with AI-generated subtitles in three simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-violet-600" />
              </div>
              <CardTitle>1. Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload your videos to our secure cloud storage. We support MP4, MOV, AVI, and WebM formats.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2">
            <CardHeader className="pb-2">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <Scissors className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>2. Clip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Select the exact segments you want to clip from your videos using our intuitive timeline editor.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2">
            <CardHeader className="pb-2">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>3. Subtitle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our AI automatically generates accurate subtitles using OpenAI's Whisper. Customize the style to match your brand.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="bg-slate-50 py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Choose Your Plan</h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Select the perfect plan for your content creation needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Free Plan */}
            <Card className="border shadow-sm hover:shadow transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>For occasional users</CardDescription>
                <p className="text-3xl font-bold mt-4">$0<span className="text-muted-foreground text-sm font-normal">/month</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {PLANS.FREE.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                    {isSignedIn ? "Go to Dashboard" : "Get Started Free"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Creator Plan */}
            <Card className="border-2 border-primary shadow-lg relative">
              <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                Popular
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Creator</CardTitle>
                <CardDescription>For content creators</CardDescription>
                <p className="text-3xl font-bold mt-4">${PLANS.CREATOR.price}<span className="text-muted-foreground text-sm font-normal">/month</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {PLANS.CREATOR.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href={isSignedIn ? "/settings" : "/sign-up"}>
                    {isSignedIn ? "Upgrade Now" : "Start Free Trial"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Pro Plan */}
            <Card className="border shadow-sm hover:shadow transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For professionals</CardDescription>
                <p className="text-3xl font-bold mt-4">${PLANS.PRO.price}<span className="text-muted-foreground text-sm font-normal">/month</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {PLANS.PRO.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={isSignedIn ? "/settings" : "/sign-up"}>
                    {isSignedIn ? "Upgrade Now" : "Start Free Trial"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto py-20 px-4 md:px-6 text-center">
        <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to create engaging content?</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Start transforming your long-form videos into captivating clips today.
        </p>
        <Button size="lg" asChild>
          <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
            {isSignedIn ? "Go to Dashboard" : "Get Started for Free"}
          </Link>
        </Button>
      </section>
      
      <LandingContent />
      
      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Clippie</h3>
              <p className="text-slate-300">
                AI-powered video clip creator for content creators.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-300 hover:text-white">Features</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white">Testimonials</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-300 hover:text-white">About</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-300 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-300">© 2023 Clippie. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-300 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="text-slate-300 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
              <a href="#" className="text-slate-300 hover:text-white">
                <span className="sr-only">YouTube</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path><path d="m10 15 5-3-5-3z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
