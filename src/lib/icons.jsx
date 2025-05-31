import React from 'react';
import { 
    TrendingUp, CreditCard, Search, FileText, Award, Edit3, BarChart2, ThumbsUp, Users, Home, BookOpen, Tag, Rss, Video, CalendarCheck, Sparkles, MessageCircle, UserCheck, PlayCircle, Download, Star, Filter, CalendarDays, UserCircle as UserCircleIcon, Briefcase, Phone, Mail, MessageSquare as MessageSquareIcon, AlertTriangle, CheckCircle2, Info as InfoIcon, XCircle, Loader2
} from 'lucide-react';

export const iconMap = {
  TrendingUp: (props) => <TrendingUp {...props} />,
  CreditCard: (props) => <CreditCard {...props} />,
  Search: (props) => <Search {...props} />,
  FileText: (props) => <FileText {...props} />,
  Award: (props) => <Award {...props} />,
  Edit3: (props) => <Edit3 {...props} />,
  BarChart2: (props) => <BarChart2 {...props} />,
  ThumbsUp: (props) => <ThumbsUp {...props} />,
  Users: (props) => <Users {...props} />,
  Home: (props) => <Home {...props} />,
  BookOpen: (props) => <BookOpen {...props} />,
  Tag: (props) => <Tag {...props} />,
  Rss: (props) => <Rss {...props} />,
  Video: (props) => <Video {...props} />,
  CalendarCheck: (props) => <CalendarCheck {...props} />,
  Sparkles: (props) => <Sparkles {...props} />,
  MessageCircle: (props) => <MessageCircle {...props} />,
  UserCheck: (props) => <UserCheck {...props} />,
  PlayCircle: (props) => <PlayCircle {...props} />,
  Download: (props) => <Download {...props} />,
  Star: (props) => <Star {...props} />,
  Filter: (props) => <Filter {...props} />,
  CalendarDays: (props) => <CalendarDays {...props} />,
  UserCircleIcon: (props) => <UserCircleIcon {...props} />,
  Briefcase: (props) => <Briefcase {...props} />,
  Phone: (props) => <Phone {...props} />,
  Mail: (props) => <Mail {...props} />,
  MessageSquareIcon: (props) => <MessageSquareIcon {...props} />,
  AlertTriangle: (props) => <AlertTriangle {...props} />,
  CheckCircle2: (props) => <CheckCircle2 {...props} />,
  InfoIcon: (props) => <InfoIcon {...props} />,
  XCircle: (props) => <XCircle {...props} />,
  Loader2: (props) => <Loader2 {...props} className="animate-spin" />,
  Default: (props) => <Sparkles {...props} /> 
};

export const getIcon = (iconName, props = {}) => {
  const IconComponent = iconMap[iconName] || iconMap.Default;
  return <IconComponent {...props} />;
};
