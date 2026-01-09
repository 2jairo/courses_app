use std::sync::Arc;

use tokio::sync::Notify;

pub fn ctrl_c_gracefull_shutdown() -> Arc<Notify> {
    // Create shutdown signal
    let shutdown = Arc::new(Notify::new());

    // Clone for signal handler
    let shutdown_clone = shutdown.clone();
    tokio::spawn(async move {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to listen for ctrl-c");
        
        println!("Received shutdown signal, waiting for current tasks to complete...");
        
        // Notify all consumers to stop
        shutdown_clone.notify_waiters();
    });

    shutdown   
}