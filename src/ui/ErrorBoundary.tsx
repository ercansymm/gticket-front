import React from "react";

type Props = {
   children: React.ReactNode;
};

type State = {
   hasError: boolean;
};

class ErrorBoundary extends React.Component<Props, State> {
   constructor(props: Props) {
      super(props);
      this.state = { hasError: false };
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   static getDerivedStateFromError(_: Error) {
      return { hasError: true };
   }

   componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error("Uncaught error:", error, errorInfo);
   }

   render() {
      if (this.state.hasError) {
         return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
               <h2>Something went wrong.</h2>
               <p>Please refresh the page or try again later.</p>
            </div>
         );
      }

      return this.props.children;
   }
}

export default ErrorBoundary;
