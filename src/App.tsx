// App.tsx
import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { BrandStory } from './components/BrandStory'
// import { JoinWsb } from './components/JoinWsb.tsx'
// import { HowItWorks } from './components/HowItWorks.tsx'
import { Footer } from './components/Footer'
import { LoadingScreen } from './components/LoadingScreen'
// import { Collections } from './components/Collections'
const Diner = lazy(() => import('./components/Diner').then(m => ({ default: m.Diner })))
const About = lazy(() => import('./components/About').then(m => ({ default: m.About })))
const FirstDinner = lazy(() => import('./components/FirstDinner').then(m => ({ default: m.FirstDinner })))
const ClothingUploadForm = lazy(() => import('./components/ClothingUploadForm').then(m => ({ default: m.ClothingUploadForm })))
const AdminClothing = lazy(() => import('./components/AdminClothing').then(m => ({ default: m.AdminClothing })))
const DinnerCollectionTwo = lazy(() => import('./components/DinnerCollectionTwo').then(m => ({ default: m.DinnerCollectionTwo })))
const Confirmation = lazy(() => import('./components/Confirmation').then(m => ({ default: m.Confirmation })))
const SimpleImageUpload = lazy(() => import('./components/SimpleImageUpload').then(m => ({ default: m.SimpleImageUpload })))
const SecondDinner = lazy(() => import('./components/SecondDinner').then(m => ({ default: m.SecondDinner })))
const Events = lazy(() => import('./components/Events').then(m => ({ default: m.Events })))
const EventDetail = lazy(() => import('./components/EventDetail').then(m => ({ default: m.EventDetail })))
// import { Collection } from './components/Collection'
// import { ThePics } from './components/ThePics'
// import { FAQ } from './components/FAQ'
// import { Reachout } from './components/Reachout'
const Login = lazy(() => import('./components/Login').then(m => ({ default: m.Login })))
const Signup = lazy(() => import('./components/Signup').then(m => ({ default: m.Signup })))
const MyUploads = lazy(() => import('./components/MyUploads').then(m => ({ default: m.MyUploads })))
const MyPicks = lazy(() => import('./components/MyPicks').then(m => ({ default: m.MyPicks })))
const MyReservations = lazy(() => import('./components/MyReservations').then(m => ({ default: m.MyReservations })))
const MyOrders = lazy(() => import('./components/MyOrders').then(m => ({ default: m.MyOrders })))
const AccountSettings = lazy(() => import('./components/AccountSettings').then(m => ({ default: m.AccountSettings })))
const Profile = lazy(() => import('./components/Profile').then(m => ({ default: m.Profile })))
const OAuthSuccess = lazy(() => import('./components/OAuthSuccess').then(m => ({ default: m.OAuthSuccess })))
const Terms = lazy(() => import('./components/Terms').then(m => ({ default: m.Terms })))
const Privacy = lazy(() => import('./components/Privacy').then(m => ({ default: m.Privacy })))
const CollectionsM = lazy(() => import('./components/CollectionsM').then(m => ({ default: m.CollectionsM })))
const CollectionsNY = lazy(() => import('./components/CollectionsNY').then(m => ({ default: m.CollectionsNY })))
const AdminReservations = lazy(() => import('./components/AdminReservations').then(m => ({ default: m.AdminReservations })))
const ThirdDinner = lazy(() => import('./components/ThirdDinner').then(m => ({ default: m.ThirdDinner })))
const OAuthCallback = lazy(() => import('./components/OAuthCallback').then(m => ({ default: m.OAuthCallback })))
const SubmissionSuccess = lazy(() => import('./components/SubsmissionSuccess').then(m => ({ default: m.SubmissionSuccess })))
const AdminPickups = lazy(() => import('./components/AdminPickups.tsx').then(m => ({ default: m.AdminPickups })))
const FourthDinner = lazy(() => import('./components/FourthDinner').then(m => ({ default: m.FourthDinner })))
const ForgotPassword = lazy(() => import('./components/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('./components/ForgotPassword').then(m => ({ default: m.ResetPassword })))
const CollectionsHK = lazy(() => import('./components/CollectionsHK').then(m => ({ default: m.CollectionsHK })))
const FifthDinner = lazy(() => import('./components/FifthDinner').then(m => ({ default: m.FifthDinner })))
const WishlistHK = lazy(() => import('./components/WishlistHK').then(m => ({ default: m.WishlistHK })))
const StaffRedeem = lazy(() => import('./components/StaffRedeem').then(m => ({ default: m.StaffRedeem })))
const MyBrand = lazy(() => import('./components/MyBrand').then(m => ({ default: m.MyBrand })))
const AdminBrands = lazy(() => import('./components/AdminBrands').then(m => ({ default: m.AdminBrands })))
const SellerLogin = lazy(() => import('./components/SellerLogin.tsx').then(m => ({ default: m.SellerLogin })))
const SellerSignup = lazy(() => import('./components/SellerSignup.tsx').then(m => ({ default: m.SellerSignup })))
import { RequireSeller } from './components/RequireSeller';
const BrandDashboard = lazy(() => import('./components/BrandDashboard').then(m => ({ default: m.BrandDashboard })))
const BrandsShop = lazy(() => import('./components/BrandsShop').then(m => ({ default: m.BrandsShop })))
const ShippingEstimate = lazy(() => import('./components/ShippingEstimate').then(m => ({ default: m.ShippingEstimate })))
const Feed = lazy(() => import('./components/Feed').then(m => ({ default: m.Feed })))
import { useAuth } from './hooks/useAuth';

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function HomePage() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Feed />;
    }

    return (
        <div className="font-sans">
            <Header />
            <main>
                <Hero />
                {/* <JoinWsb /> */}
                {/* <HowItWorks /> */}
                <BrandStory />
            </main>
            <Footer />
        </div>
    )
}

export function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Set to 3500ms to match LoadingScreen animation duration
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3500); // 👈 Actualizado a 3.5 segundos

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <AuthProvider>
            <Router>
                <ScrollToTop />
                <Suspense fallback={<div className="min-h-screen" />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/next" element={<EventDetail />} />
                    {/* <Route path="/collections" element={<Collections />} /> */}
                    <Route path="/diner" element={<Diner />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/first-dinner" element={<FirstDinner />} />
                    <Route path="/second-dinner" element={<SecondDinner />} />
                    <Route path="/upload" element={<ClothingUploadForm />} />
                    <Route path="/admin/clothing" element={<AdminClothing />} />
                    <Route path="/dinner-collection-two" element={<DinnerCollectionTwo />} />
                    <Route path="/confirmation" element={<Confirmation />} />
                    <Route path="/upload-images" element={<SimpleImageUpload />} />
                    {/* <Route path="/collection" element={<Collection />} /> */}
                    {/* <Route path="/the-pics" element={<ThePics />} /> */}
                    {/* <Route path="/faq" element={<FAQ />} /> */}
                    {/* <Route path="/reachout" element={<Reachout />} /> */}
                    <Route path="/my-uploads" element={<MyUploads />} />
                    <Route path="/my-picks" element={<MyPicks />} />
                    <Route path="/my-reservations" element={<MyReservations />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/settings" element={<AccountSettings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/oauth-success" element={<OAuthSuccess />} />
                    {/* Legal Pages */}
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/cookies" element={<Privacy />} />
                    <Route path="/collections-m" element={<CollectionsM />} />
                    <Route path="/admin/reservations" element={<AdminReservations />} />
                    <Route path="/collections-ny" element={<CollectionsNY />} />

                    <Route path="/third-dinner" element={<ThirdDinner />} />
                    <Route path="/oauth/callback" element={<OAuthCallback />} />
                    <Route path="/submission-success" element={<SubmissionSuccess />} />
                    <Route path="/admin/pickups" element={<AdminPickups />} />
                    <Route path="/fourth-dinner" element={<FourthDinner />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/collections-hk" element={<CollectionsHK />} />
                    <Route path="/fifth-dinner" element={<FifthDinner />} />
                    <Route path="/wishlist" element={<WishlistHK />} />
                    <Route path="/staff/redeem" element={<StaffRedeem />} />
                    <Route path="/admin/brands" element={<AdminBrands />} />
                    <Route path="/seller/login" element={<SellerLogin />} />
                    <Route path="/seller/signup" element={<SellerSignup />} />
                    <Route path="/brand" element={<RequireSeller><MyBrand /></RequireSeller>} />
                    <Route path="/brand/dashboard" element={<RequireSeller><BrandDashboard /></RequireSeller>} />
                    <Route path="/shop" element={<BrandsShop />} />
                    <Route path="/shipping-estimate" element={<ShippingEstimate />} />


                </Routes>
                </Suspense>
            </Router>
        </AuthProvider>
    )
}